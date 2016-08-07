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
		function put(lat, lng) {
			rs.push(Math.sin(lng)*Math.sin(lat));
			rs.push(Math.cos(lat));
		}
		for (i = 0; i < lat_count - 1; ++i) {
			for (j = 0; j < lng_count - 1; ++j) {
				put(lat * i, lng * j);

				put(lat*(i + 1), lng * j);

				put(lat*(i + 1), lng*(j+1));
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

	var vs = 'attribute vec2 pos;' +
	`void main() {
		gl_Position = vec4(pos.x, pos.y * .5, 0, 1);
	}`;
	var fs = 'precision mediump float;' +
	`void main() {
		gl_FragColor = vec4(1, 0, 0, 1);
	}`;

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

	+function step() {
		//requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
	}()
}()
