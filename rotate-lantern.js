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
		};
		return program;
	}

	function createLantern(lat, lng, span) {
		var lat_count = Math.PI / lat;
		var lng_count = span / lng;
		var i, j;
		var rs = [];
		var colors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
		function put_color(lng, lat) {
			var factor = lng / Math.PI * 2 % 1;
			var idx = Math.floor(factor * 3);
			var color = colors[idx];
			[].push.apply(rs, color);
			rs.push(Math.sqrt(Math.sqrt(Math.sin(lat))));
		}
		function put(lat, lng) {
			rs.push(Math.sin(lng)*Math.sin(lat));
			rs.push(Math.cos(lat));
			rs.push(Math.sin(lat)*Math.cos(lng));
		}
		for (i = 0; i < lat_count; ++i) {
			for (j = 0; j < lng_count; ++j) {
                                put(lat * i, lng * j);

                                put_color(lng * j, lat * i);

                                put(lat*(i + 1), lng * j);

                                put_color(lng * j, lat * i);

                                put(lat*(i + 1), lng*(j + 1));

                                put_color(lng * j, lat * i);
				


				put(lat * i, lng * j);

				put_color(lng * j, lat * i);
			
				put(lat*(i + 1), lng*(j + 1));

				put_color(lng * j, lat * i);

				put(lat * i, lng*(j + 1));

                                put_color(lng * j, lat*i);
			}
		}
		return rs;
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
	var gl = canvas.getContext('webgl', {
		'premultipliedAlpha': false
	});

	var vs = 'attribute vec3 pos;attribute vec4 color;uniform float angle;varying vec4 color_;' +
	`void main() {
		float x = pos.x;
		float y = pos.y;
		float z = pos.z;
		float new_x = x * cos(angle) - z * sin(angle);
		float new_y = y * .6;
		float new_z = x * sin(angle) + z * cos(angle);

		gl_Position = vec4(new_x, new_y, new_z, 1);
		color_ = color;
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' +
	`void main() {
		gl_FragColor = color_;
	}`;
	var program = createProgram(vs, fs).use();

	var pos = gl.getAttribLocation(program, 'pos');
	var color = gl.getAttribLocation(program, 'color');
	var angle = gl.getUniformLocation(program, 'angle');
	var vertices = createLantern(.1, .1, 2* Math.PI);

	gl.enable(gl.BLEND);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 4*3+4*4, 0);
	gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 4*3+4*4, 4*3);

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	+function step() {
		gl.uniform1f(angle, new Date/1000%(2*Math.PI));
		requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 7);
	}()
}()

