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
		program.use = function() {
			gl.useProgram(program);
			return program;
		}
		return program;
	}

	function createCanvas() {
		var div = document.createElement('div');
		div.innerHTML = '<canvas width=300 height=300></canvas>';
		document.addEventListener('DOMContentLoaded', function() {
			document.body.appendChild(div);
		});
		return div.querySelector('canvas');
	}

	var canvas = createCanvas();
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = [0, 2 * Math.PI / 3, 2 * Math.PI / 3 * 2];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute float pos;uniform float angle;uniform float rotate;varying float vPos;' +
	`void main() {
		float x = sin(pos + angle);
		float y = cos(pos + angle);
		float z = 1. / sqrt(2.);

		float new_x = x;
		float new_y = y * cos(rotate) - z * sin(rotate);
		float new_z = y * sin(rotate) + z * cos(rotate);

		gl_Position = vec4(new_x, new_y, new_z, 1.);
		vPos = pos;
	}`;
	var fs = 'precision mediump float;varying float vPos;' + 'void main() { gl_FragColor = vec4(abs(mix(sin(vPos), cos(vPos), abs(sin(vPos)))), .8, abs(mix(cos(vPos), sin(vPos), abs(sin(vPos)))), 1); }';

	var program = createProgram(vs, fs).use();

	var pos = gl.getAttribLocation(program, 'pos');
	var angle = gl.getUniformLocation(program, 'angle');
	var rotate = gl.getUniformLocation(program, 'rotate');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 0, 0);

	+function step() {
		gl.uniform1f(angle, new Date/1000%(2*Math.PI));
		gl.uniform1f(rotate, new Date/1200%(2*Math.PI));
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		requestAnimationFrame(step);
	}()
}()
