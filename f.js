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
		var rs = [
            -.75, -.75, -.25,
            -.75, .75, -.25,
            -.25, -.75, -.25,
            -.25, -.75, -.25,
            -.75, .75, -.25,
            -.25, .75, -.25,


            -.25, .75, -.25,
            .75, .75, -.25,
            -.25, .5, -.25,
            -.25, .5, -.25,
            .75, .75, -.25,
            .75, .5, -.25,


            -.25, .25, -.25,
            .5, .25, -.25,
            -.25, 0, -.25,
            -.25, 0, -.25,
            .5, .25, -.25,
            .5, 0, -.25,


            -.25, 0, -.25,
            .5, 0, -.25,
            -.25, 0, .25,
            -.25, 0, .25,
            .5, 0, -.25,
            .5, 0, .25,


            -.75, -.75, -.25,
            -.25, -.75, -.25,
            -.75, -.75, .25,
            -.75, -.75, .25,
            -.25, -.75, -.25,
            -.25, -.75, .25,

            
            -.75, -.75, .25,
            -.25, -.75, .25,
            -.75, .75, .25,
            -.25, -.75, .25,
            -.25, .75, .25,
            -.75, .75, .25,

            
            -.75, .75, -.25,
            -.75, .75, .25,
            .75, .75, -.25,
            .75, .75, -.25,
            -.75, .75, .25,
            .75, .75, .25,

            
            -.75, .75, -.25,
            -.75, -.75, -.25,
            -.75, -.75, .25,
        ];
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
	gl.cullFace(gl.FRONT);
	
	gl.enableVertexAttribArray(pos);
	gl.enableVertexAttribArray(color);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);
	gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 4*vertices.length / 2);
    console.log(4*vertices.length / 2, vertices.length / 6)

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	+function step() {
		//var val_angle = new Date/1000%(2*Math.PI);
		//var val_rotate = new Date/1200%(2*Math.PI);
		var val_angle = .5;
		var val_rotate = 0;
		gl.uniform1f(angle, val_angle);
		gl.uniform1f(rotate, val_rotate);
		document.title = val_angle + ',' + val_rotate;
		requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.STATIC_DRAW);
	}()
}()

