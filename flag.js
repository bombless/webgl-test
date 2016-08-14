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
		for (i = 0; i < lat_count; ++i) {
			for (j = 0; j < lng_count; ++j) {
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

	var vertices = createFlag(.1, .01, 10);
	console.log(vertices.length);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = `
	attribute vec3 pos;
	attribute vec4 color;
	uniform float scale;
	uniform float rotate;
	varying vec4 color_;
	void main() {
		mat3 v_rotate = mat3(
			vec3(1, 0, 0),
			vec3(0, cos(rotate), -sin(rotate)),
			vec3(0, sin(rotate), cos(rotate))
		);

		vec3 o = scale * v_rotate * pos;

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
	var scale = gl.getUniformLocation(program, 'scale');
	var rotate = gl.getUniformLocation(program, 'rotate');
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 7 * 4, 0);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 7 * 4, 3 * 4);

	+function step() {
		vertices = createFlag(.1, .01, 10);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.DYNAMIC_DRAW);
		//gl.uniform1f(scale, .2 + Math.abs(new Date/10000%.2));
		gl.uniform1f(scale, .1);
		gl.uniform1f(rotate, new Date/10000%(2*Math.PI));
		//gl.uniform1f(rotate, .9);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 7);
		requestAnimationFrame(step);
	}()
}()
