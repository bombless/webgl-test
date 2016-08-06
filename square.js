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

	var div = document.createElement('div');
	div.innerHTML = '<canvas width=300 height=300></canvas>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = [0, Math.PI / 2, Math.PI, Math.PI, 3 * Math.PI / 2, 0];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute float pos;varying float vPos;' + 'void main() { gl_Position = vec4(sin(pos), cos(pos), 0, 1); vPos = pos; }';
	var fs = 'precision mediump float;varying float vPos;' + 'void main() { gl_FragColor = vec4(abs(mix(sin(vPos), cos(vPos), abs(sin(vPos)))), .8, abs(mix(cos(vPos), sin(vPos), abs(sin(vPos)))), 1); }';

	var program = createProgram(vs, fs);
	console.log(program);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	+function step() {
		var diff = +new Date/1000%(2*Math.PI);
		vertices = [diff, Math.PI / 2 + diff, Math.PI + diff, Math.PI + diff, 3 * Math.PI / 2 + diff, diff];
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		requestAnimationFrame(step);
	}()
}()
