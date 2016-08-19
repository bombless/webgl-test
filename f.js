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

	function createF() {
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
        [].push.apply(rs, colors);
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

		gl_Position = vec4(new_x, new_y, 0, new_z);
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
	var vertices = createF();

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
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	+function step() {
		gl.uniform1f(rotate, new Date/1000%(2*Math.PI));
        gl.uniform1f(angle, 0);
        //gl.uniform1f(rotate, -1);
		requestAnimationFrame(step);
		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
	}()
}()

