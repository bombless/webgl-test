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
		var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!linked) throw gl.getProgramInfoLog(program);
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
	varying vec2 texCoord1;
	varying vec2 texCoord2;
	varying vec2 texCoord3;
	varying vec2 texCoord4;
	varying vec2 texCoord5;
	void main() {
		mat3 v_rotate = mat3(
			vec3(1, 0, 0),
			vec3(0, cos(rotate), -sin(rotate)),
			vec3(0, sin(rotate), cos(rotate))
		);

		vec3 o = scale * v_rotate * (pos + vec3(-move, 0, 0));
		vec3 ot = scale * (pos + vec3(-move, 0, 0));
		texCoord1 = vec2(-.5, -.1) + ot.xy * 4.;
		texCoord2 = vec2(.0, -.1) + ot.xy * 8.;
		texCoord3 = vec2(.3, -.8) + ot.xy * 8.;
		texCoord4 = vec2(-.9, .7) + ot.xy * 8.;
		texCoord5 = vec2(-2., .7) + ot.xy * 8.;

		gl_Position = vec4(o.x * -1., o.y * .7, 0, o.z * .3 + .5);
		color_ = color;
	}`;
	var fs = `
	precision mediump float;
	varying vec4 color_;
	varying vec2 texCoord1;
	varying vec2 texCoord2;
	varying vec2 texCoord3;
	varying vec2 texCoord4;
	varying vec2 texCoord5;
	uniform sampler2D sampler;
	void main() {
		vec4 c1 = texture2D(sampler, texCoord1);
		vec4 c2 = texture2D(sampler, texCoord2);
		vec4 c3 = texture2D(sampler, texCoord3);
		vec4 c4 = texture2D(sampler, texCoord4);
		vec4 c5 = texture2D(sampler, texCoord5);
		if (texCoord1.x < 1. && texCoord1.x > .0 && texCoord1.y < 1. && texCoord1.y > .0 && c1.w > .1) {
			gl_FragColor = mix(color_, c1, .5);
		} else if (texCoord2.x < 1. && texCoord2.x > .0 && texCoord2.y < 1. && texCoord2.y > .0 && c2.w > .1) {
			gl_FragColor = mix(color_, c2, .5);
		} else if (texCoord3.x < 1. && texCoord3.x > .0 && texCoord3.y < 1. && texCoord3.y > .0 && c3.w > .1) {
			gl_FragColor = mix(color_, c3, .5);
		} else if (texCoord4.x < 1. && texCoord4.x > .0 && texCoord4.y < 1. && texCoord4.y > .0 && c4.w > .1) {
			gl_FragColor = mix(color_, c4, .5);
		} else if (texCoord5.x < 1. && texCoord5.x > .0 && texCoord5.y < 1. && texCoord5.y > .0 && c5.w > .1) {
			gl_FragColor = mix(color_, c5, .5);
		} else {
			gl_FragColor = vec4(1., .0, .0, 1.);
		}
		
	}`;

	var program = createProgram(vs, fs).use();

	var pos = gl.getAttribLocation(program, 'pos');
	var color = gl.getAttribLocation(program, 'color');
	var move = gl.getUniformLocation(program, 'move');
	var scale = gl.getUniformLocation(program, 'scale');
	var rotate = gl.getUniformLocation(program, 'rotate');
	var texture;
	+function() {
		var t_ = gl.createTexture();
		var i_ = new Image();
		i_.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, t_);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i_);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			texture = t_;
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, t_);
		};
		i_.src = 'star.png';
	}();
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 7 * 4, 0);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
	gl.uniform1i(gl.getUniformLocation(program, 'sampler'), 0);

	+function step() {
		requestAnimationFrame(step);
		if (!texture) return;
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
	}()
}()
