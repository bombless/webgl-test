/// http://www.webgltutorials.org/ply.html
var LoadPLY = (function() {
  // PLY object
  function PLY() {
    this.object;
  }

  // Path to folder where models are stored
  var ModelFolderPath = "./";

  // Number of vertices in PLY file
  var PLY_Vertices = 0;

  // Number of faces in PLY file
  var PLY_Faces = 0;

  // For skipping header
  var ReadingPLYData = false;

  // 11 entries per vertex (x,y,z,nx,ny,nz,r,g,b,u,v)
  var PLY_DataLenght = 11;

  var VAO_VertexIndex = 0;

  var FaceIndex = 0;

  // PLY file vertex entry format
  function PLY_Vertex(x, y, z, nx, ny, nz, u, v, r, g, b) {
    this.x = 0; // a_Position
    this.y = 0;
    this.z = 0;
    this.nx = 0; // a_Normal
    this.ny = 0;
    this.nz = 0;
    this.u = 0; // a_Texture
    this.v = 0;
    this.r = 0; // a_Color
    this.g = 0;
    this.b = 0;
  }

  // PLY file face consisting of 3 vertex indices for each face
  function PLY_Face(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  // Load PLY function;
  function LoadPLY(filename, callback) {
    var vertices = null;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onload = function() {
      var data = xmlhttp.responseText;

      var lines = data.split("\n");

      var PLY_index = 0;

      var arrayVertex, arrayNormal, arrayTexture, arrayColor, arrayIndex;

      var vertices = null;

      var faces = null;

      console.log("PLY number of lines = " + lines.length);

      for (var i = 0; i < lines.length; i++) {
        if (ReadingPLYData) {
          var e = lines[i].split(" ");

          // Read vertices
          if (PLY_index < PLY_Vertices) {
            vertices[PLY_index] = new PLY_Vertex();
            vertices[PLY_index].x = e[0];
            vertices[PLY_index].y = e[1];
            vertices[PLY_index].z = e[2];
            vertices[PLY_index].nx = e[3];
            vertices[PLY_index].ny = e[4];
            vertices[PLY_index].nz = e[5];
            vertices[PLY_index].u = e[6];
            vertices[PLY_index].v = e[7];
            vertices[PLY_index].r = e[8];
            vertices[PLY_index].g = e[9];
            vertices[PLY_index].b = e[10];

            // Read faces
          } else {
            // Reset index for building VAOs
            if (PLY_index == PLY_Vertices) {
              console.log("Resetting Index...");

              FaceIndex = 0;

              VAO_VertexIndex = 0;
            }

            // Wire face data to appropriate vertices
            var n = parseInt(e[0]);

            if (FaceIndex < PLY_Faces) {
              // We don't really have to *store* face data
              // faces[FaceIndex] = new PLY_Face(a, b, c);

              // vertices
              for (var j = 0; j < n; j++) {
                arrayVertex.push(vertices[e[j + 1]].x);
                arrayVertex.push(vertices[e[j + 1]].y);
                arrayVertex.push(vertices[e[j + 1]].z);
              }

              // normals
              for (var j = 0; j < n; j++) {
                arrayNormal.push(vertices[e[j + 1]].nx);
                arrayNormal.push(vertices[e[j + 1]].ny);
                arrayNormal.push(vertices[e[j + 1]].nz);
              }

              // colors
              for (var j = 0; j < n; j++) {
                arrayColor.push(vertices[e[j + 1]].r);
                arrayColor.push(vertices[e[j + 1]].g);
                arrayColor.push(vertices[e[j + 1]].b);
              }

              // uv
              for (var j = 0; j < n; j++) {
                arrayTexture.push(vertices[e[j + 1]].u);
                arrayTexture.push(vertices[e[j + 1]].v);
              }

              // index
              arrayIndex.push(FaceIndex);
            }

            FaceIndex++;
          }

          PLY_index++;
        } else {
          // Still reading header...

          // Read number of vertices stored in the file
          if (lines[i].substr(0, "element vertex".length) == "element vertex")
            PLY_Vertices = lines[i].split(" ")[2];

          // Read number of faces stored in the file
          if (lines[i].substr(0, "element face".length) == "element face")
            PLY_Faces = lines[i].split(" ")[2];
        }

        // Finished reading header data, prepare for reading vertex data
        if (lines[i] == "end_header") {
          // Allocate enough space for vertices
          vertices = new Array(PLY_Vertices);

          // Allocate enough space for faces
          faces = new Array(PLY_Faces);

          // Allocate memory for returned arrays (VAOs)
          arrayVertex = new Array(); // PLY_Vertices * 3
          arrayNormal = new Array(); // PLY_Vertices * 3
          arrayTexture = new Array(); // PLY_Vertices * 2
          arrayColor = new Array(); // PLY_Vertices * 3
          arrayIndex = new Array(); // PLY_Vertices * 1

          ReadingPLYData = true;
        }
      }

      console.log("PLY_Vertices = " + PLY_Vertices + " loaded");
      console.log("PLY_Faces = " + PLY_Faces + " loaded");
      console.log("arrayVertex length = " + arrayVertex.length);
      console.log("arrayNormal length = " + arrayNormal.length);
      console.log("arrayTexture length = " + arrayTexture.length);
      console.log("arrayColor length = " + arrayColor.length);
      console.log("arrayIndex length = " + arrayIndex.length);

      // We now have both complete vertex and face data loaded;
      // return everything we loaded as Float32Array & Uint16Array for index

      callback([
        arrayVertex,
        arrayNormal,
        arrayTexture,
        arrayColor,
        arrayIndex
      ]);
    };

    console.log("Loading Model <" + filename + ">...");

    xmlhttp.open("GET", ModelFolderPath + filename, true);
    xmlhttp.send();
  }
  return LoadPLY;
})();

