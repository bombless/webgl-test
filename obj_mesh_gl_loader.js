class ObjMeshGlLoader {
  constructor(gl) {
    this.gl = gl;
    this.programs = new ObjMeshGlProgram(gl);
  }
  getTypeNVerticesCount(n, count) {
    switch (n) {
      case 1: return count / 3;
      case 2: return count / 5;
      case 3: return count / 8;
      case 4: return count / 6;
    }
  }
  load(mesh_container) {
    for (let i = 0; i < 4; i += 1) {
      const n = i + 1;
      if (mesh_container['type' + n].length) {
        this['type' + n + '_buffer'] = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this['type' + n + '_buffer']);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh_container['type' + n]), this.gl.STATIC_DRAW);
        this['type' + n + '_color_buffer'] = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this['type' + n + '_color_buffer']);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 3 * 4 * this.getTypeNVerticesCount(n, mesh_container['type' + n].length), this.gl.DYNAMIC_DRAW);
      } else {
        delete this['type' + n + '_buffer'];
        delete this['type' + n + '_color_buffer'];
      }
    }
    this.programs.prepareProgram(this);
  }
  getTypeNGap(n) {
    switch(n) {
      case 1: return 4 * 3;
      case 2: return 4 * 5;
      case 3: return 4 * 8;
      case 4: return 4 * 6;
    }
  }
  draw(values) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (let i = 0; i < 4; i += 1) {
      const n = i + 1;
      if (this['type' + n + '_buffer']) {
        const program = this.programs['type' + n + '_program'];
        const gl = this.gl;
        
        gl.useProgram(program);

        const angleX = gl.getUniformLocation(program, 'angleX');
        const angleY = gl.getUniformLocation(program, 'angleY');
        const angleZ = gl.getUniformLocation(program, 'angleZ');
        const depth = gl.getUniformLocation(program, 'depth');
        const translationX = gl.getUniformLocation(program, 'translationX');
        const translationY = gl.getUniformLocation(program, 'translationY');

        gl.uniform1f(angleX, values.angleX);
        gl.uniform1f(angleY, values.angleY);
        gl.uniform1f(angleZ, values.angleZ);
        gl.uniform1f(depth, values.depth);
        gl.uniform1f(translationX, values.translationX);
        gl.uniform1f(translationY, values.translationY);
        
        const posX = gl.getAttribLocation(program, 'posX');
        const posY = gl.getAttribLocation(program, 'posY');
        const posZ = gl.getAttribLocation(program, 'posZ');

        gl.enableVertexAttribArray(posX);
        gl.enableVertexAttribArray(posY);
        gl.enableVertexAttribArray(posZ);

        gl.bindBuffer(gl.ARRAY_BUFFER, this['type' + n + '_buffer']);

        gl.vertexAttribPointer(posX, 1, gl.FLOAT, false, this.getTypeNGap(n), 0);
        gl.vertexAttribPointer(posY, 1, gl.FLOAT, false, this.getTypeNGap(n), 4);
        gl.vertexAttribPointer(posZ, 1, gl.FLOAT, false, this.getTypeNGap(n), 8);

        const r = gl.getAttribLocation(program, 'r');
        const g = gl.getAttribLocation(program, 'g');
        const b = gl.getAttribLocation(program, 'b');

        gl.bindBuffer(gl.ARRAY_BUFFER, this['type' + n + '_color_buffer']);

        const color_buffer_width = gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE);

        gl.vertexAttribPointer(r, 1, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(g, 1, gl.FLOAT, false, 0, color_buffer_width / 3);
        gl.vertexAttribPointer(b, 1, gl.FLOAT, false, 0, color_buffer_width / 3 * 2);

        const colors = [[], [], []];

        for (let j = 0; j < color_buffer_width / 4 / 3; j += 1) {
          function get_random(from, to) {
            const lower = Math.min(from, to);
            const range = Math.max(from, to) - Math.min(from, to);
            return Math.random() * range + lower;
          }
          colors[0].push(get_random(values.crrf, values.crrt));
          colors[1].push(get_random(values.crgf, values.crgt));
          colors[2].push(get_random(values.crbf, values.crbt));
        }
        colors[0].sort();
        colors[1].sort();
        colors[2].sort();

        const color_buff = [];
        Array.prototype.push.apply(color_buff, colors[0]);
        Array.prototype.push.apply(color_buff, colors[1]);
        Array.prototype.push.apply(color_buff, colors[2]);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(color_buff), gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, color_buffer_width / 4 / 3);
      }
    }
  }
}
