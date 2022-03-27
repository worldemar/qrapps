var canvas = document.getElementById('gl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl = canvas.getContext('webgl');

zz = (x,y) => { x += 1; y+=1; return x+y; }
_new_buf = (t, a) => {
  b = gl.createBuffer ();
  gl.bindBuffer(t, b);
  gl.bufferData(t, a, gl.STATIC_DRAW);
  return b;
}

var BUF_V = _new_buf(gl.ARRAY_BUFFER, new Float32Array(C_V));
var BUF_C = _new_buf(gl.ARRAY_BUFFER, new Float32Array(C_C));
var BUF_I = _new_buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(C_I));

var vertCode = 
   'attribute vec3 position;'+
   'attribute vec3 color;'+
   'uniform mat4 Pmtx;'+
   'uniform mat4 Vmtx;'+
   'uniform mat4 Mmtx;'+
   'varying vec3 vColor;'+
   'void main(void) { '+
      'gl_Position = Pmtx*Vmtx*Mmtx*vec4(position, 1.);'+
      'vColor = color;'+
   '}';

var fragCode = 
  'precision mediump float;'+
  'varying vec3 vColor;'+
  'void main(void) { gl_FragColor = vec4(vColor, 1.0); }';

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderprogram = gl.createProgram();
gl.attachShader(shaderprogram, vertShader);
gl.attachShader(shaderprogram, fragShader);
gl.linkProgram(shaderprogram);

var _Pmtx = gl.getUniformLocation(shaderprogram, "Pmtx");
var _Vmtx = gl.getUniformLocation(shaderprogram, "Vmtx");
var _Mmtx = gl.getUniformLocation(shaderprogram, "Mmtx");

gl.bindBuffer(gl.ARRAY_BUFFER, BUF_V);
var _position = gl.getAttribLocation(shaderprogram, "position");
gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
gl.enableVertexAttribArray(_position);

gl.bindBuffer(gl.ARRAY_BUFFER, BUF_C);
var _color = gl.getAttribLocation(shaderprogram, "color");
gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
gl.enableVertexAttribArray(_color);
gl.useProgram(shaderprogram);

function _m_proj(angle, a, zMin, zMax) {
  var dz = (zMax-zMin);
  var ang = Math.tan((angle*.5)*Math.PI/180);
  return [
      0.5/ang,         0,                 0,   0,
            0, 0.5*a/ang,                 0,   0,
            0,         0,   -(zMax+zMin)/dz,  -1,
            0,         0, (-2*zMax*zMin)/dz,   0 
    ];
}

var prj_mtx = _m_proj(40, canvas.width/canvas.height, 1, 100);
var mdl_mtx = _m_i /* model matrix */
var vw_mtx = _m_i /* view matrix */
vw_mtx[14] = -3; /* -5 units back off zero so we can see origin */

var THETA = 0;

var animate = function(time) {
  mdl_mtx = _m_i /* model matrix */

  mdl_mtx = mrY(mdl_mtx, THETA);
  mdl_mtx = mrX(mdl_mtx, -THETA);

   time_old = time; 
   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0, 0, 0, 1);
   gl.clearDepth(1.0);
   gl.viewport(0.0, 0.0, canvas.width, canvas.height);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   gl.uniformMatrix4fv(_Pmtx, false, prj_mtx);
   gl.uniformMatrix4fv(_Vmtx, false, vw_mtx);
   gl.uniformMatrix4fv(_Mmtx, false, mdl_mtx);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUF_I);
   gl.drawElements(gl.TRIANGLES, C_I.length, gl.UNSIGNED_SHORT, 0);

  THETA += 0.01;

   requestAnimationFrame(animate);
}
animate(0);