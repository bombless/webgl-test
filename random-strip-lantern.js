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

	function createLantern(lat, lng, span) {
		var alpha, beta, grammar;
		var lat_count = Math.PI / lat;
		var lng_count = span / lng;
		var i, j, lat_val, lng_val;
		var rs = [];
		var seed_pool = {};
		var colors = [[1, 0, 0, 1], [0, 1, 0, 1],
				[0, 0, 1, 1]];
		function put_color(seed) {
			if (!seed_pool[seed]) {
				seed_pool[seed] = Math.random();
			}
			var factor = seed_pool[seed] % 1;
			var idx = Math.floor(factor / .34);
			[].push.apply(rs, colors[idx]);
		}
		function put(lat, lng) {
			rs.push(Math.sin(lng)*Math.sin(lat));
			rs.push(Math.cos(lat));
			rs.push(Math.sin(lat));
		}
		for (j = 0; j < lng_count - 1; ++j) {
			for (i = 0; i < lat_count - 1; ++i) {
                                put(lat * i, lng * j);

                                put_color(lng * j);

                                put(lat*(i + 1), lng*j);

                                put_color(lng * j);

                                put(lat*(i + 1), lng*(j + 1));

                                put_color(lng * j);
				


				put(lat * i, lng * j);

				put_color(lng * j);
			
				put(lat*(i + 1), lng*(j + 1));

				put_color(lng * j);

				put(lat*(i), lng*(j + 1));

                                put_color(lng * j);
			}
		}
		return rs;
	}

	var div = document.createElement('div');
	div.innerHTML = '<canvas width=300 height=300></canvas>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var gl = canvas.getContext('webgl', {
		'premultipliedAlpha': false
	});

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = createLantern(.1, .1, 2*Math.PI+.02);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute vec3 pos;attribute vec4 color;varying vec4 color_;' +
	`void main() {
		gl_Position = vec4(pos.x, pos.y * .5, pos.z, 1);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' +
	`void main() {
		gl_FragColor = color_;
	}`;

	var program = createProgram(vs, fs);
	gl.useProgram(program);
	gl.enable(gl.BLEND);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	var pos = gl.getAttribLocation(program, 'pos');
	var color = gl.getAttribLocation(program, 'color');
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 4*3+4*4, 0);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 4*3+4*4, 4*3);

	+function step() {
		//requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 7);
	}()
}()