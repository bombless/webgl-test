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
		var first_time = true;
		return function() {
			var i, j;
			var output = [];
			var diff = [];
			var gray;
			for (i = 0; i < NUM; ++i) {
				diff.push((+new Date/1000 + Math.PI/NUM*i)%(2*Math.PI));
			}
			for (i = 0; i < NUM; ++i) {
				for (j = 0; j < vertices_tpl.length; ++j) {
					output.push(vertices_tpl[j]);
					output.push(diff[i]);
					gray = 1/NUM*i*.7+.2;
					output.push(gray);
					if (first_time) {
						console.log(gray);
					}
				}
			}
			first_time = false;
			return output;
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
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(list), gl.DYNAMIC_DRAW);

	var vs = 'attribute float pos;attribute float angle;attribute float gray;varying float factor;' + 'void main() { gl_Position = vec4(sin(pos) * cos(angle), cos(pos), 0, 1); factor = gray; }';
	var fs = 'precision mediump float;uniform vec3 color;varying float factor;' + 'void main() { gl_FragColor = vec4(factor, factor, factor, 1); }';

	var program = createProgram(vs, fs);
	gl.useProgram(program);
	
	var color = gl.getUniformLocation(program, 'color');
	var pos = gl.getAttribLocation(program, 'pos');
	var angle = gl.getAttribLocation(program, 'angle');
	var gray = gl.getAttribLocation(program, 'gray');
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 1, gl.FLOAT, false, 3 * 4, 0);
	gl.enableVertexAttribArray(angle);
	gl.vertexAttribPointer(angle, 1, gl.FLOAT, false, 3 * 4, 4);
	gl.enableVertexAttribArray(gray);
	gl.vertexAttribPointer(gray, 1, gl.FLOAT, false, 3 * 4, 8);
	gl.uniform3f(color, 1, 0, 0);
	
	+function step() {
		var list = getVertexList();
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(list), gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, list.length / 3);
		requestAnimationFrame(step);
	}()
}()
