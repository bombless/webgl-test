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

	var vertices = [0, 2 * Math.PI / 3, 2 * Math.PI / 3 * 2];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute float pos;varying float vPos;' + 'void main() { gl_Position = vec4(sin(pos), cos(pos), 0, 1); vPos = pos; }';
	var fs = 'precision mediump float;varying float vPos;' + 'void main() { gl_FragColor = vec4(abs(mix(sin(vPos), cos(vPos), abs(sin(vPos)))), .8, abs(mix(cos(vPos), sin(vPos), abs(sin(vPos)))), 1); }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	+function step() {
		var diff = +new Date/1000%(2*Math.PI);
		vertices = [diff, 2 * Math.PI / 3 + diff, 2 * Math.PI / 3 * 2 + diff];
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		requestAnimationFrame(step);
	}()
}()