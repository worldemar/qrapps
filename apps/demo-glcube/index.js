var canvas = document.getElementById('gl');
CW = canvas.width = window.innerWidth;
CH = canvas.height = window.innerHeight;
gl = canvas.getContext('webgl');

_new_buf = (t, a) => {
  b = gl.createBuffer();
  gl.bindBuffer(t, b);
  gl.bufferData(t, a, gl.STATIC_DRAW);
  return b;
}
var BUF_V = _new_buf(gl.ARRAY_BUFFER, new Float32Array(C_V));
var BUF_C = _new_buf(gl.ARRAY_BUFFER, new Float32Array(C_C));
var BUF_I = _new_buf(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(C_I));

var vertCode = 
   'attribute vec3 p;'+ // position
   'attribute vec3 c;'+ // color
   'uniform mat4 m;'+ // combined matrix
   'varying vec3 C;'+ // color to pass to frag
   'void main(void) { '+
      'gl_Position = m*vec4(p, 1.);'+
      'C = c;'+
   '}';

var fragCode = 
  'precision lowp float;'+
  'varying vec3 C;'+
  'void main(void) { gl_FragColor = vec4(C, 1.0); }';

_sp = gl.createProgram();
_n_shd = (t, c) => {
  _shd = gl.createShader(t);
  gl.shaderSource(_shd, c);
  gl.compileShader(_shd);
  gl.attachShader(_sp, _shd);
  return _shd;
}
_vS = _n_shd(gl.VERTEX_SHADER, vertCode);
_fS = _n_shd(gl.FRAGMENT_SHADER, fragCode);
gl.linkProgram(_sp);

_mtx = gl.getUniformLocation(_sp, "m");

_glbb = (b, s) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  _z = gl.getAttribLocation(_sp, s);
  gl.vertexAttribPointer(_z, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(_z);
}
_glbb(BUF_V, "p");
_glbb(BUF_C, "c");

gl.useProgram(_sp);

_m_prj = (a, as, zMin, zMax) => {
  var dz = (zMax-zMin);
  var ang = Math.tan((a)*3.14/360); // Math.tan((angle*.5)*Math.PI/180);
  return [
      0.5/ang,         0,                 0,   0,
            0,  as/ang/2,                 0,   0,
            0,         0,   -(zMax+zMin)/dz,  -1,
            0,         0, (-2*zMax*zMin)/dz,   0 
    ];
}

var prj_mtx = _m_prj(40, CW/CH, 1, 100);
var mdl_mtx = _m_i /* model matrix */
var vw_mtx = _m_i /* view matrix */
vw_mtx[14] = -3; /* -5 units back off zero so we can see origin */

var A = 0;

animate = (time) => {
  mdl_mtx = _m_i /* model matrix */

  mdl_mtx = mrY(mdl_mtx, A);
  mdl_mtx = mrX(mdl_mtx, -A);

   time_old = time; 
   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0, 0, 0, 1);
   gl.clearDepth(1.0);
   gl.viewport(0.0, 0.0, CW, CH);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   gl.uniformMatrix4fv(_mtx, false, m4MM(prj_mtx,m4MM(vw_mtx, mdl_mtx)));

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, BUF_I);
   gl.drawElements(gl.TRIANGLES, C_I.length, gl.UNSIGNED_SHORT, 0);

  A += 0.01;

   requestAnimationFrame(animate);
}
animate(0);