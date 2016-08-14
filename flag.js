+function() {
	function createShader(str, type) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!success) {
			throw "could not compile shader:" + gl.getShaderInfoLog(shader);
		}
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
		div.innerHTML = '<canvas width=600 height=600></canvas>';
		document.addEventListener('DOMContentLoaded', function() {
			document.body.appendChild(div);
		});
		return div.querySelector('canvas');
	}

	function createFlag(lat, lng, span) {
		var lat_count = Math.PI / lat;
		var lng_count = span / lng;
		var i, j;
		var output = [];
		var z_factor = .1 + new Date / 200 % .6;
		function put(lat, lng) {
			var span_start = Math.floor(lng / Math.PI) * 2 - 3;
			output.push(span_start + Math.sin(lng % Math.PI - Math.PI / 2));
			output.push(-Math.cos(lat));
			output.push(Math.sin(lng) * z_factor);output.push(1, 0, 0, 1);return;
			var idx = put.idx || 0;
			if (!idx) {
				output.push(1, 0, 0, 1);
			} else if (idx == 1) {
				output.push(0, 1, 0, 1);
			} else {
				output.push(0, 0, 1, 1);
			}
			put.idx = (idx + 1) % 3;
		}
		for (j = 0; j < lng_count; ++j) {
			for (i = 0; i < lat_count; ++i) {
				put(lat * i, lng * j);
				put(lat * (i + 1), lng * j);
				put(lat * (i + 1), lng * (j + 1));

				put(lat * i, lng * j);
				put(lat * (i + 1), lng * (j + 1));
				put(lat * i, lng * (j + 1));
			}
		}
		return output;
	}

	var canvas = createCanvas();
	var gl = canvas.getContext('webgl');

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = createFlag(.1, .01, 24);
	console.log(vertices.length);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = `
	attribute vec3 pos;
	attribute vec4 color;
	uniform float scale;
	uniform float move;
	uniform float rotate;
	varying vec4 color_;
	void main() {
		mat3 v_rotate = mat3(
			vec3(1, 0, 0),
			vec3(0, cos(rotate), -sin(rotate)),
			vec3(0, sin(rotate), cos(rotate))
		);

		vec3 o = scale * v_rotate * (pos + vec3(-move, 0, 0));

		gl_Position = vec4(o.xy, 0, o.z * .3 + .5);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' +
	`void main() {
		gl_FragColor = color_;
	}`;

	var program = createProgram(vs, fs).use();

	var pos = gl.getAttribLocation(program, 'pos');
	var color = gl.getAttribLocation(program, 'color');
	var move = gl.getUniformLocation(program, 'move');
	var scale = gl.getUniformLocation(program, 'scale');
	var rotate = gl.getUniformLocation(program, 'rotate');
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 7 * 4, 0);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 7 * 4, 3 * 4);

	+function step() {
		var triangle_count = vertices.length / 7 / 3;
		var min = Math.floor(new Date / 1000 % 1 * .3 * triangle_count) * 3;
		//vertices = createFlag(.1, .01, 10);
		//gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		gl.uniform1f(scale, .26 + Math.abs(new Date/10000%.1));
		//gl.uniform1f(scale, .1);
		gl.uniform1f(move, vertices[min * 7] + .5);
		gl.uniform1f(rotate,  .3 + Math.abs(new Date/16000%.1));
		//gl.uniform1f(rotate, .9);
		//gl.drawArrays(gl.TRIANGLES, 0, triangle_count * 3);
		gl.drawArrays(gl.TRIANGLES, min, Math.floor(triangle_count *.7) * 3);
		requestAnimationFrame(step);
	}()
}()
