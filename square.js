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

	var div = document.createElement('div');
	div.innerHTML = '<canvas width=300 height=300></canvas>' +
		'<div style="height:10px; background-color:rgb(0,0,0)"></div>';
	document.addEventListener('DOMContentLoaded', function() {
		document.body.appendChild(div);
	});
	var canvas = div.querySelector('canvas');
	var panel = div.querySelector('div');
	var gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
	canvas.addEventListener('mousedown', function(ev) {
		var x = ev.clientX, y = ev.clientY;
		var rect = ev.target.getBoundingClientRect();
		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
			var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
			var pixels = new Uint8Array(4);
			gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			panel.style.backgroundColor = 'rgb(' + pixels[0] + ',' + pixels[1] + ',' + pixels[2] + ')';
		}
	});

	var buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	var vertices = [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4, Math.PI / 4];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

	var vs = 'attribute float pos;uniform float rotate;varying float vPos;' +
	`void main() {
		float x = sin(pos);
		float y = cos(pos);
		float z = 0.;
		float new_x = x;
		float new_y = y * cos(rotate) - z * sin(rotate);
		float new_z = y * sin(rotate) + z * cos(rotate);
		float p_z = new_z * .5 + 1.;
		gl_Position = vec4(new_x / p_z, new_y / p_z, 0, 1.);
		vPos = pos;
	}`;
	var fs = 'precision mediump float;varying float vPos;' +
	`void main() {
		float r;
		float g;
		float b;
		if (vPos < 2.) {
			r = 1.; g = .0; b = .0;
		} else if (vPos < 3.) {
			r = .0; g = 1.; b = .0;
		} else if (vPos < 5.) {
			r = .0; g = .0; b = 1.;
		} else {
			r = abs(mix(sin(vPos), cos(vPos), abs(sin(vPos))));
			g = .8;
			b = abs(mix(cos(vPos), sin(vPos), abs(sin(vPos))));
		}
		gl_FragColor = vec4(r, g, b, 1.);
	}`;

	var program = createProgram(vs, fs);
	gl.useProgram(program);

	var pos = gl.getAttribLocation(program, 'pos');
	var rotate = gl.getUniformLocation(program, 'rotate');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 0, 0);
	gl.clearColor(1, 1, 1, 1);

	+function step() {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(rotate, new Date/1000%(2*Math.PI));
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		requestAnimationFrame(step);
	}()
}()
