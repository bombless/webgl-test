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
		var vertices_tpl = [0, Math.PI / 2, Math.PI, Math.PI, 3 * Math.PI / 2, 0];
		var NUM = 4;
		var colors = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]];
		return function() {
			var i, j;
			var output = [];
			var diff = [];
			var time = new Date/1000;
			for (i = 0; i < NUM; ++i) {
				diff.push((time + 2*Math.PI/NUM*i)%(2*Math.PI));
			}
			for (i = 0; i < NUM; ++i) {
				for (j = 0; j < vertices_tpl.length; ++j) {
					output.push(vertices_tpl[j] + Math.PI / 4);
					output.push(diff[i]);
					[].push.apply(output, colors[i]);
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

	var vs = 'attribute float pos;attribute float angle;attribute vec3 color;varying vec3 color_;' +
	`void main() {
		float x = sin(pos);
		float y = cos(pos);
		float z = 1. / sqrt(2.);
		float new_x = x * cos(angle) - z * sin(angle);
		float new_y = y;
		float new_z = x * sin(angle) + z * cos(angle);
		gl_Position = vec4(new_x * .7, new_y * .7, new_z * .7, 1.);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec3 color_;' + 'void main() { gl_FragColor = vec4(color_, 1.0); }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	var angle = gl.getAttribLocation(program, 'angle');
	var color = gl.getAttribLocation(program, 'color');

	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 4 + 4 + 12, 0);
	gl.enableVertexAttribArray(angle);
	gl.vertexAttribPointer(angle, 1, gl.FLOAT, false, 4 + 4 + 12, 4);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 4 + 4 + 12, 8);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	+function step() {
		var list = getVertexList();
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(list), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, list.length / 5);
		requestAnimationFrame(step);
	}()
}()
