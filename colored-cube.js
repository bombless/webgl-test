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
			var time = new Date/1000;
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
					diff.push((time + 2*Math.PI/NUM*i)%(2*Math.PI));
				}
				for (i = 0; i < NUM; ++i) {
					for (j = 0; j < vertices_tpl.length; ++j) {
						[].push.apply(output, genCoverTile(vertices_tpl[j] + Math.PI / 4, diff[i]));
						[].push.apply(output, colors[i]);
						output.push(1);
					}
				}
				return output;
			}

			function genTop() {
				var i;
				var output = [];
				var diff = time % (2*Math.PI);
				for (i = 0; i < vertices_tpl.length; ++i) {
					[].push.apply(output, genTopTile(vertices_tpl[i] + Math.PI / 4, diff));
					output.push(0, 0, 0 ,1);
				}
				return output;
			}

			function genBottom() {
				var i, j;
				var output = [];
				var diff = time % (2*Math.PI);
				for (j = 0; j < vertices_tpl.length; ++j) {
					[].push.apply(output, genBottomTile(vertices_tpl[j] + Math.PI / 4, diff));
					output.push(0, 0, 0 ,1);
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

			function genTopTile(theta, angle) {
				var x = Math.sin(theta);
				var z = Math.cos(theta);
				var y = 1 / Math.sqrt(2);

				var new_x = x * Math.cos(angle) - z * Math.sin(angle);
				var new_y = y;
				var new_z = x * Math.sin(angle) + z * Math.cos(angle);

				return [new_x * .7, new_y * .7, new_z * .7];
			}

			function genBottomTile(theta, angle) {
				var x = Math.sin(theta);
				var z = Math.cos(theta);
				var y = -1 / Math.sqrt(2);

				var new_x = x * Math.cos(angle) - z * Math.sin(angle);
				var new_y = y;
				var new_z = x * Math.sin(angle) + z * Math.cos(angle);

				return [new_x * .7, new_y * .7, new_z * .7];
			}
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
	
	console.log(list)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(list), gl.DYNAMIC_DRAW);

	var vs = 'attribute vec3 data;attribute vec4 color;varying vec4 color_;' +
	`void main() {
		gl_Position = vec4(data, 1.);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' + 'void main() { gl_FragColor = color_; }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var data = gl.getAttribLocation(program, 'data');
	var color = gl.getAttribLocation(program, 'color');

	gl.enableVertexAttribArray(data);
	gl.vertexAttribPointer(data, 3, gl.FLOAT, false, 4 * (3 + 4), 0);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 4 * (3 + 4), 12);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	+function step() {
		var list = getVertexList();
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(list), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, list.length / 7);
		requestAnimationFrame(step);
	}()
}()
