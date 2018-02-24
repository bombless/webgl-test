+function() {
  
  var canvas = createCanvas();
  var gl = canvas.getContext('webgl');

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

		console.log(gl.getShaderInfoLog(vshader));
		
		gl.attachShader(program, vshader);
		gl.attachShader(program, fshader);
		gl.linkProgram(program);
		program.use = function() {
			gl.useProgram(program);
			console.log(gl.getError())
			return program;
		};
		return program;
  }
  
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

  LoadPLY("teapot.ply.txt", data => {
    console.log(data[0])
    init(data[0], data[3]);
  });

  function get_colors(verticies_count) {    
    const input_fields = ['crrf', 'crrt', 'crgf', 'crgt', 'crbf', 'crbt'];
    var values = {}, tmp;
    var i, colors = [[], [], []];
    for (i = 0; i < input_fields.length; i += 1) {
      tmp = document.getElementById(input_fields[i]);
      values[input_fields[i]] = parseInt(tmp? tmp.value: 0) / 256;
    }
    function get_random(from, to) {
      var lower = Math.min(from, to);
      var range = Math.max(from, to) - Math.min(from, to);
      return Math.random() * range + lower;
    }
    for (i = 0; i < verticies_count; ++i) {
			colors[i % 3].push(get_random(values[input_fields[i % 3 * 2]], values[input_fields[i % 3 * 2 + 1]]));
    }
    colors[0].sort();
    colors[1].sort();
    colors[2].sort();
    // console.log(get_colors[values.crrf + values.crrt], values.crrf + values.crrt in get_colors)
    if (!(values.crrf + values.crrt in get_colors)) {
      get_colors[values.crrf + values.crrt] = true;
      console.log(colors[0][0], colors[1][0], colors[2][0]);
    }
    return colors;
  }

  function init(vertices) {
    var original_length = vertices.length;
    var colors = get_colors(vertices.length);
    Array.prototype.push.apply(vertices, colors[0]);
    Array.prototype.push.apply(vertices, colors[1]);
    Array.prototype.push.apply(vertices, colors[2]);

    var vs = 'attribute float posX, posY, posZ;attribute float r, g, b;uniform float angleX, angleY, angleZ, depth, translationX, translationY;varying vec4 color;' +
    `
    vec3 rotateX(vec3 pos, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      float newY = pos.y * c + pos.z * s;
      float newZ = pos.y * (-s) + pos.z * c;
      return vec3(pos.x, newY, newZ);
    }
    vec3 rotateY(vec3 pos, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      float newX = pos.x * c + pos.z * s;
      float newZ = pos.x * (-s) + pos.z * c;
      return vec3(newX, pos.y, newZ);
    }
    vec3 rotateZ(vec3 pos, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      float newX = pos.x * c + pos.y * s;
      float newY = pos.x * (-s) + pos.y * c;
      return vec3(newX, newY, pos.z);
    }
    void main() {
      vec3 pos_ = rotateX(rotateY(rotateZ(vec3(posX, posY, posZ) * .2, angleZ), angleY), angleX);
      gl_Position = vec4(pos_ + vec3(translationX, translationY, 0.0), pos_.z * .5 + .5 + depth);
      color = vec4(r, g, b, 1.);
    }`;
    var fs = 'precision mediump float;varying vec4 color;' +
    `void main() {
      gl_FragColor = color;
    }`;
    var program = createProgram(vs, fs).use();

    var posX = gl.getAttribLocation(program, 'posX');
    var posY = gl.getAttribLocation(program, 'posY');
    var posZ = gl.getAttribLocation(program, 'posZ');
    var r = gl.getAttribLocation(program, 'r');
    var g = gl.getAttribLocation(program, 'g');
    var b = gl.getAttribLocation(program, 'b');
    var angleX = gl.getUniformLocation(program, 'angleX');
    var angleY = gl.getUniformLocation(program, 'angleY');
    var angleZ = gl.getUniformLocation(program, 'angleZ');
    var depth = gl.getUniformLocation(program, 'depth');
    var translationX = gl.getUniformLocation(program, 'translationX');
    var translationY = gl.getUniformLocation(program, 'translationY');

    // gl.enable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    // gl.disable(gl.CULL_FACE);
    // gl.disable(gl.BLEND);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    
    gl.enableVertexAttribArray(posX);
    gl.enableVertexAttribArray(posY);
    gl.enableVertexAttribArray(posZ);
    gl.enableVertexAttribArray(r);
    gl.enableVertexAttribArray(g);
    gl.enableVertexAttribArray(b);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.vertexAttribPointer(posX, 1, gl.FLOAT, false, 4 * 3, 0);
    gl.vertexAttribPointer(posY, 1, gl.FLOAT, false, 4 * 3, 4);
    gl.vertexAttribPointer(posZ, 1, gl.FLOAT, false, 4 * 3, 8);
    gl.vertexAttribPointer(r, 1, gl.FLOAT, false, 0, 4 * original_length);
    gl.vertexAttribPointer(g, 1, gl.FLOAT, false, 0, 4 * original_length + 4 * original_length / 3);
    gl.vertexAttribPointer(b, 1, gl.FLOAT, false, 0, 4 * original_length + 4 * original_length / 3 + 4 * original_length / 3);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    +function step() {
      var input_angleX = document.getElementById('angleX');
      var val_angleX = parseInt(input_angleX? input_angleX.value: 0) / 360 * 2 * Math.PI;
      var input_angleY = document.getElementById('angleY');
      var val_angleY = parseInt(input_angleY? input_angleY.value: 0) / 360 * 2 * Math.PI;
      var input_angleZ = document.getElementById('angleZ');
      var val_angleZ = parseInt(input_angleZ? input_angleZ.value: 0) / 360 * 2 * Math.PI;
      var input_depth = document.getElementById('depth');
      var val_depth = parseFloat(input_depth? input_depth.value: 0);
      var input_translationX = document.getElementById('translationX');
      var val_translationX = parseFloat(input_translationX? input_translationX.value: 0);
      var input_translationY = document.getElementById('translationY');
      var val_translationY = parseFloat(input_translationY? input_translationY.value: 0);
      gl.uniform1f(angleX, val_angleX);
      gl.uniform1f(angleY, val_angleY);
      gl.uniform1f(angleZ, val_angleZ);
      gl.uniform1f(depth, val_depth);
      gl.uniform1f(translationX, val_translationX);
      gl.uniform1f(translationY, val_translationY);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      requestAnimationFrame(step);
      gl.drawArrays(gl.TRIANGLES, 0, original_length / 3);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(vertices), gl.STATIC_DRAW);
      vertices.length = original_length;
      var colors = get_colors(original_length);
      Array.prototype.push.apply(vertices, colors[0]);
      Array.prototype.push.apply(vertices, colors[1]);
      Array.prototype.push.apply(vertices, colors[2]);
    }();
  }
}();
