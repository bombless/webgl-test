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

	function createF(n) {
		var data = {
			'1': [-.5, .75],
			'3': [-.25, .75],
			'5': [.5, .75],
			'7': [.5, .5],
			'9': [.5, .25],
			'11': [.5, 0],
			'13': [-.25, .5],
			'15': [-.25, .25],
			'17': [-.25, 0],
			'19': [-.5, -.5],
			'21': [-.25, -.5]
		};
		function getData(n) {
			n = parseInt(n);
			if (n % 2) {
				return [data[n][0], data[n][1], -.25];
			}
			return [data[n - 1][0], data[n - 1][1], .25];
		}
		var raw = `
		2 4 22, 2 22 20, 2 20 19, 2 19 1, 3 1 19, 3 19 21, 20 22 21, 20 21 19, 13 15 16, 13 16 14, 17 21 22, 17 22 18, 1 5 6, 1 6 2, 4 6 8, 4 8 14, 14 8 7, 14 7 13, 7 5 3, 7 3 13, 5 7 8, 5 8 6, 15 9 10, 15 10 16, 16 10 12, 16 12 18, 18 12 11, 18 11 17, 11 9 15, 11 15 17, 10 9 11, 10 11 12
		`;

		// raw = '15 9 10, 15 10 16, 16 10 12, 16 12 18, 18 12 11, 18 11 17, 11 9 15, 11 15 17, 10 9 11, 10 11 12';

		var rs = [];
		raw.split(',').forEach(val => {
			val.trim().split(' ').forEach(val => [].push.apply(rs, getData(val)));
		});
        var i, len = rs.length, colors = [];
        console.log(rs);
        for (i = 0; i < len; ++i) {
            colors.push(Math.random());
        }
        colors.sort();
        if (n != null) {
            for (i = n * 6 * 3; i < (n + 1) * 6 * 3 && i < colors.length; i += 3) {
                colors[i] = 1;
            }
        }
        [].push.apply(rs, colors);
        return rs;
	}

	var cnt = 0;    
	var vertices = createF();
	console.log(vertices);
	function createCanvas() {
		var div = document.createElement('div');
		div.innerHTML = '<canvas width=300 height=300></canvas><button>click</button>';
		document.addEventListener('DOMContentLoaded', function() {
			document.body.appendChild(div);
            div.querySelector('button').addEventListener('click', function() {
                this.textContent = cnt;
                vertices = createF(cnt);
                cnt += 1;
            });
		});

		return div.querySelector('canvas');
	}

	var canvas = createCanvas();
	var gl = canvas.getContext('webgl', {
		'premultipliedAlpha': false
	});

	var vs = 'attribute vec3 pos, color;uniform float angle, rotate;varying vec4 color_;' +
	`void main() {
		vec3 pos_ = pos * .2;
		float x = pos_.x;
		float y = pos_.y;
		float z = pos_.z;
		float new_y = y * cos(angle) - z * sin(angle);
		float new_x = x;
		float new_z = y * sin(angle) + z * cos(angle);

		new_x = new_x * cos(rotate) - new_y * sin(rotate);
		new_y = new_x * sin(rotate) + new_y * cos(rotate);

		new_z = new_z * .5 + .5;

		gl_Position = vec4(new_x, new_y, 0., new_z);
		color_ = vec4(color, 1.);
	}`;
	var fs = 'precision mediump float;varying vec4 color_;' +
	`void main() {
		gl_FragColor = color_;
	}`;
	var program = createProgram(vs, fs).use();

	var pos = gl.getAttribLocation(program, 'pos');
	var color = gl.getAttribLocation(program, 'color');
	var angle = gl.getUniformLocation(program, 'angle');
	var rotate = gl.getUniformLocation(program, 'rotate');

	gl.enable(gl.BLEND);
	gl.enable(gl.CULL_FACE);
	// gl.disable(gl.CULL_FACE);
	gl.cullFace(gl.FRONT);
	
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 4*vertices.length / 2);
    console.log(4*vertices.length / 2, vertices.length / 6)

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	+function step() {
		var val_angle = new Date/1000%(2*Math.PI);
		//var val_rotate = new Date/1200%(2*Math.PI);
		// var val_angle = 0;
		var val_rotate = Math.PI;
		gl.uniform1f(angle, val_angle);
		gl.uniform1f(rotate, val_rotate);
		document.title = val_angle + ',' + val_rotate;
		requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.STATIC_DRAW);
	}()
}()

