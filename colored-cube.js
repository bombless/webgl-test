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
		var colors = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1]];
		return function() {
			var output = [];
			[].push.apply(output, genBottom());
			[].push.apply(output, genTop());
			[].push.apply(output, genCover());
			return output;

			function genCover() {
				var i, j;
				var output = [];
				var diff = [];
				for (i = 0; i < NUM; ++i) {
					diff.push(2*Math.PI/NUM*i);
				}
				for (i = 0; i < NUM; ++i) {
					for (j = 0; j < vertices_tpl.length; ++j) {
						[].push.apply(output, genCoverTile(vertices_tpl[vertices_tpl.length - j - 1] + Math.PI / 4, diff[i]));
						[].push.apply(output, colors[i]);
						output.push(1);
					}
				}
				return output;
			}

			function genTop() {
				var i;
				var output = [];
				for (i = 0; i < vertices_tpl.length; ++i) {
					[].push.apply(output, genTopTile(vertices_tpl[i] + Math.PI / 4));
					output.push(1, 0, 1, 1);
				}
				return output;
			}

			function genBottom() {
				var i;
				var output = [];
				for (i = vertices_tpl.length - 1; i >= 0; --i) {
					[].push.apply(output, genBottomTile(vertices_tpl[i] + Math.PI / 4));
					output.push(1, 1, 0, 1);
				}
				return output;
			}

			function genCoverTile(theta, angle) {
				var x = Math.sin(theta);
				var y = Math.cos(theta);
				var z = 1 / Math.sqrt(2);

				var new_x = x * Math.cos(angle) - z * Math.sin(angle);
				var new_y = y;
				var new_z = x * Math.sin(angle) + z * Math.cos(angle);

				return [new_x * .7, new_y * .7, new_z * .7];
			}

			function genTopTile(theta) {
				var x = Math.sin(theta);
				var z = Math.cos(theta);
				var y = 1 / Math.sqrt(2);

				return [x * .7, y * .7, z * .7];
			}

			function genBottomTile(theta) {
				var x = Math.sin(theta);
				var z = Math.cos(theta);
				var y = -1 / Math.sqrt(2);

				return [x * .7, y * .7, z * .7];
			}
		};

	})();

	var getTranslation = (function() {
		var translation = [0, 0];
		var A = 65, D = 68, W = 87, S = 83;
		var last_time, c, b;
		setTimeout(function step() {
			var now = Date.now();
			var diff = now - last_time;

			if (diff < 600) {
				translation[0] = easing.easeOutQuad(
					0, diff, b[0], c[0], 600);
				translation[1] = easing.easeOutQuad(
          0, diff, b[1], c[1], 600);
			}
			setTimeout(step, 50);
		
		}, 100);
		
		addEventListener('keyup', function() {
			var x = translation[0];
			var y = translation[1];
			if (event.keyCode == A) {
				last_time = Date.now();
				b = [x, y];
				c = [-.1, 0];
			} else if (event.keyCode == D) {
				last_time = Date.now();
				b = [x, y];
				c = [.1, 0];
			} else if (event.keyCode == S) {
				last_time = Date.now();
				b = [x, y];
				c = [0, -.1];
			} else if (event.keyCode == W) {
				last_time = Date.now();
				b = [x, y];
				c = [0, .1];
			}
		});
		return function () {
			return translation;
		};
	})();

	var getScale = (function() {
		var scale = 1;
		var MINUS = 109, PLUS = 107;
		
		addEventListener('keyup', function() {
			if (event.keyCode == PLUS) {
				scale /= .99;
			} else if (event.keyCode == MINUS) {
				scale *= .99;
			}
		});
		return function () {
			return scale;
		};
	})();

	var div = document.createElement('div');
	var cube_vertices = getVertexList();
	var vertices_count = cube_vertices.length / 7;
	div.innerHTML = '<canvas width=300 height=300></canvas>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	gl.bufferData(gl.ARRAY_BUFFER, cube_vertices.length * 4 + 16 * vertices_count, gl.DYNAMIC_DRAW);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(cube_vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute vec3 data;attribute vec4 color;attribute float angle;attribute float scale;attribute vec2 translation;uniform float rotate;varying vec4 color_;' +
	`void main() {
		float x = data.x * scale;
		float y = data.y * scale;
		float z = data.z * scale;

		float new_y = y * cos(angle) - z * sin(angle);
		float new_x = x;
		float new_z = y * sin(angle) + z * cos(angle);

		new_x = new_x * cos(rotate) - new_z * sin(rotate);
		new_z = new_x * sin(rotate) + new_z * cos(rotate);

		gl_Position = vec4(new_x + translation.x, new_y + translation.y, new_z, 1.);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' + 'void main() { gl_FragColor = color_; }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var data = gl.getAttribLocation(program, 'data');
	var color = gl.getAttribLocation(program, 'color');
	var angle = gl.getAttribLocation(program, 'angle');
	var scale = gl.getAttribLocation(program, 'scale');
	var translation = gl.getAttribLocation(program, 'translation');
	var rotate = gl.getUniformLocation(program, 'rotate');

	gl.enableVertexAttribArray(data);
	gl.vertexAttribPointer(data, 3, gl.FLOAT, false, 4 * (3 + 4), 0);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 4 * (3 + 4), 12);
	gl.enableVertexAttribArray(angle);
	gl.vertexAttribPointer(angle, 1, gl.FLOAT, false, 0, cube_vertices.length * 4);
	gl.enableVertexAttribArray(scale);
	gl.vertexAttribPointer(scale, 1, gl.FLOAT, false, 0, cube_vertices.length * 4 + vertices_count * 4);
	gl.enableVertexAttribArray(translation);
	gl.vertexAttribPointer(translation, 2, gl.FLOAT, false, 0, cube_vertices.length * 4 + vertices_count * 8);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	+function step() {
		var angle = new Date/1200%(2*Math.PI), scale = getScale(), translation = getTranslation();
		var i, angle_list = [], scale_list = [], translation_list = [];
		for (i = 0; i < vertices_count; ++i) {
			angle_list.push(angle);
			scale_list.push(scale);
			[].push.apply(translation_list, translation);
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, cube_vertices.length * 4, new Float32Array(angle_list), gl.DYNAMIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, cube_vertices.length * 4 + angle_list.length * 4, new Float32Array(scale_list), gl.DYNAMIC_DRAW);
		gl.bufferSubData(gl.ARRAY_BUFFER, cube_vertices.length * 4 + angle_list.length * 4 + scale_list.length * 4, new Float32Array(translation_list), gl.DYNAMIC_DRAW);
		gl.uniform1f(rotate, new Date/1000%(2*Math.PI));
		gl.drawArrays(gl.TRIANGLES, 0, vertices_count);
		requestAnimationFrame(step);
	}()
}()
