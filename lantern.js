+function() {
	function createShader(str, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		return shader;
	}

	function createProgram(vs, fs) {
		var program = gl.createProgram();
		var vshader = createShader(vs, gl.VERTEX_SHADER);
		var fshader = createShader(fs, gl.FRAGMENT_SHADER);
		
		gl.attachShader(program, vshader);
		gl.attachShader(program, fshader);
		gl.linkProgram(program);
		return program;
	}

	function createLantern(lat, lng, span) {
		var alpha, beta, grammar;
		var lat_count = Math.PI / lat;
		var lng_count = span / lng;
		var i, j, lat_val, lng_val;
		var rs = [];
		for (i = 0; i < lat_count - 1; ++i) {
			for (j = 0; j < lng_count - 1; ++j) {
				rs.push(Math.sin(lng*j)*Math.sin(lat*i));
				rs.push(Math.cos(lat*i));
				rs.push(Math.sin(lat*i));

				rs.push(Math.sin(lng*j)*Math.sin(lat*(i+1)));
                                rs.push(Math.cos(lat*(i+1)));
                                rs.push(Math.sin(lat*(i+1)));

				rs.push(Math.sin(lng*(j+1))*Math.sin(lat*(i+1)));
				rs.push(Math.cos(lat*(i+1)));
				rs.push(Math.sin(lat*(i+1)));
			}
		}
		return rs;
	}

	var div = document.createElement('div');
	div.innerHTML = '<canvas width=300 height=300></canvas>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = createLantern(.1, .1, 1);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute vec3 pos;varying float vPos;' +
	`void main() {
		gl_Position = vec4(pos, 1);
	}`;
	var fs = 'precision mediump float;' +
	`void main() {
		gl_FragColor = vec4(1, 0, 0, 1);
	}`;

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);

	return;
	+function step() {
		var diff = +new Date/1000%(2*Math.PI);
		vertices = [diff, Math.PI / 2 + diff, Math.PI + diff, Math.PI + diff, 3 * Math.PI / 2 + diff, diff];
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		requestAnimationFrame(step);
	}()
}()
