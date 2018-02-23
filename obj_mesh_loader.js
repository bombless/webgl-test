class ObjMeshLoader {
  constructor(canvas, src) {
    this.gl = canvas.getContext('webgl');
    this.parseSource(src);
    console.log(this)
  }
  perform() {
    let gl_loader = new ObjMeshGlLoader(this.gl);
    gl_loader.load(this);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    this.gl.enable(this.gl.DEPTH_TEST);
    const step = () => {
      gl_loader.draw(this.getValues());
      requestAnimationFrame(step);
    };
    step();
  }
  getValues() {
    var values = {};
    let i;

    const colors_input_fields = ['crrf', 'crrt', 'crgf', 'crgt', 'crbf', 'crbt'];
    for (i = 0; i < colors_input_fields.length; i += 1) {
      const tmp = document.getElementById(colors_input_fields[i]);
      values[colors_input_fields[i]] = parseInt(tmp? tmp.value: 0) / 256;
    }

    const angles_input_fields = ['angleX', 'angleY', 'angleZ'];
    for (i = 0; i < angles_input_fields.length; i += 1) {
      const tmp = document.getElementById(angles_input_fields[i]);
      values[angles_input_fields[i]] = parseFloat(tmp? tmp.value: 0) / 360 * 2 * Math.PI;
    }

    const input_fields = ['depth', 'translationX', 'translationY'];
    for (i = 0; i < input_fields.length; i += 1) {
      const tmp = document.getElementById(input_fields[i]);
      values[input_fields[i]] = parseFloat(tmp? tmp.value: 0);
    }
    return values;
  }
  parseSource(src) {
    this.type1 = []; // f v0 v1 v2 ...
    this.type2 = []; // f v0/vt0 v1/vt1 ...
    this.type3 = []; // f v0/vt0/vn0 v1/vt1/vn1 ...
    this.type4 = []; // f v0//vn0 v1//vn1 ...

    let positions = [];
    let normals = [];
    let textures = [];

    src.split(/\s*\n/).forEach((line, idx) => {
      const components = line.split(/\s+/);
      switch (components[0]) {
        case 'v':
          positions.push([parseFloat(components[1]), parseFloat(components[2]), parseFloat(components[3])]);
          break;
        case 'vn':
          normals.push([parseFloat(components[1]), parseFloat(components[2]), parseFloat(components[3])]);
          break;
        case 'vt':
          textures.push([parseFloat(components[1]), parseFloat(components[2])]);
          break;
        case 'f':
          console.log('line', idx, components.slice(1))
          components.slice(1).forEach(com => {
            let matches;
            if (/^\d+$/.test(com)) {
              const n = parseInt(com);
              Array.prototype.push.apply(this.type1, positions[n - 1]);
            } else if (matches = com.match(/^(\d+)\/(\d+)$/)) {
              Array.prototype.push.apply(this.type2, positions[parseInt(matches[1]) - 1]);
              Array.prototype.push.apply(this.type2, textures[parseInt(matches[2]) - 1]);
            } else if (matches = com.match(/^(\d+)\/(\d+)\/(\d+)$/)) {
              Array.prototype.push.apply(this.type3, positions[parseInt(matches[1]) - 1]);
              Array.prototype.push.apply(this.type3, textures[parseInt(matches[2]) - 1]);
              Array.prototype.push.apply(this.type3, normals[parseInt(matches[3]) - 1]);
            } else if (matches = com.match(/^(\d+)\/\/(\d+)$/)) {
              Array.prototype.push.apply(this.type4, positions[parseInt(matches[1]) - 1]);
              Array.prototype.push.apply(this.type4, normals[parseInt(matches[2]) - 1]);
            }
          });
      }
    });
  }
}
