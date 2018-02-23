class ObjMeshGlProgram {  
  constructor(gl) {
    this.gl = gl;
  }
  createShader(str, type) {
    var shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, str);
    this.gl.compileShader(shader);
    return shader;
  }
  prepareProgram(buffers) {
    for (let i = 0; i < 4; i += 1) {
      const n = i + 1;
      if (buffers['type' + n + '_buffer']) {
        const program = this.gl.createProgram();
        const src_vs = this.getVSSource(n);
        const vshader = this.createShader(src_vs, this.gl.VERTEX_SHADER);
        const src_fs = this.getFSSource(n);
        const fshader = this.createShader(src_fs, this.gl.FRAGMENT_SHADER);
        this.gl.attachShader(program, vshader);
        this.gl.attachShader(program, fshader);
        this.gl.linkProgram(program);
        this['type' + n + '_program'] = program;
      } else {
        delete this['type' + n + '_program'];
      }
    }
  }
  getVSSource(n) {
    return 'attribute float posX, posY, posZ, r, g, b;uniform float angleX, angleY, angleZ, depth, translationX, translationY;varying vec4 color;' +
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
    bool isnan(float val) {
      return !(val <= 0.0 || 0.0 <= val);
    }
    void main() {
      vec3 pos_ = rotateX(rotateY(rotateZ(vec3(posX, posY, posZ) * .2, angleZ), angleY), angleX);
      gl_Position = vec4(pos_ + vec3(translationX, translationY, 0.0), pos_.z * .5 + .5 + depth);
      color = vec4(r, g, b, 1.);
    }`;
  }
  getFSSource(n) {
    return 'precision mediump float;varying vec4 color;' +
    `void main() {
      gl_FragColor = color;
    }`;
  }
}
