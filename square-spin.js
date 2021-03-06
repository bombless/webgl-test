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

	var getVertexList = (function() {
		var vertices_tpl = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4, Math.PI / 4];
		var NUM = 4;
		return function() {
			var i, j;
			var output = [];
			var diff = [];
			var gray;
			for (i = 0; i < NUM; ++i) {
				diff.push((+new Date/1000 + Math.PI*2/NUM*i)%(2*Math.PI));
			}
			for (i = 0; i < NUM; ++i) {
				for (j = 0; j < vertices_tpl.length; ++j) {
					output.push(vertices_tpl[j]);
					output.push(diff[i]);
					gray = 1/NUM*i*.7+.2;
					output.push(gray);
				}
			}
			return output;
		};
	})();

	var div = document.createElement('div');
	var list = getVertexList();
	div.innerHTML = '<canvas width=300 height=300></canvas>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(list), gl.DYNAMIC_DRAW);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	var vs = 'attribute float pos;attribute float angle;attribute float gray;varying float factor;' +
	`void main() {
		float x = sin(pos);
		float y = cos(pos);
		float z = 1. / sqrt(2.);

		float new_x = x * cos(angle) - z * sin(angle);
		float new_y = y;
		float new_z = x * sin(angle) + z * cos(angle);
		gl_Position = vec4(new_x * .7, new_y * .7, new_z * .7, 1.);
		factor = gray;
	}`;
	var fs = 'precision mediump float;varying float factor;' + 'void main() { gl_FragColor = vec4(factor, factor, factor, 1); }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);
	
	var pos = gl.getAttribLocation(program, 'pos');
	var angle = gl.getAttribLocation(program, 'angle');
	var gray = gl.getAttribLocation(program, 'gray');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 3 * 4, 0);
	gl.enableVertexAttribArray(angle);
	gl.vertexAttribPointer(angle, 1, gl.FLOAT, false, 3 * 4, 4);
	gl.enableVertexAttribArray(gray);
	gl.vertexAttribPointer(gray, 1, gl.FLOAT, false, 3 * 4, 8);
	
	+function step() {
		var list = getVertexList();
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(list), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, list.length / 3);
		requestAnimationFrame(step);
	}()
}()
