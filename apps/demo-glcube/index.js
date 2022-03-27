var canvas = document.getElementById('gl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl = canvas.getContext('webgl');


var vertex_buffer = gl.createBuffer ();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(C_V), gl.STATIC_DRAW);

var color_buffer = gl.createBuffer ();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(C_C), gl.STATIC_DRAW);

var index_buffer = gl.createBuffer ();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(C_I), gl.STATIC_DRAW);

var vertCode = 
   'attribute vec3 position;'+
   'uniform mat4 Pmtx;'+
   'uniform mat4 Vmtx;'+
   'uniform mat4 Mmtx;'+
   'attribute vec3 color;'+
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

gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
var _position = gl.getAttribLocation(shaderprogram, "position");
gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
gl.enableVertexAttribArray(_position);

gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
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


var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

var mouseDown = function(e) {
   drag = true;
   old_x = e.pageX, old_y = e.pageY;
   e.preventDefault();
   return false;
};

var mouseUp = function(e){
   drag = false;
};

var mouseMove = function(e) {
   if (!drag) return false;
   dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
   dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
   THETA+= dX;
   PHI+=dY;
   old_x = e.pageX, old_y = e.pageY;
   e.preventDefault();
};

canvas.addEventListener("mousedown", mouseDown, false);
canvas.addEventListener("mouseup", mouseUp, false);
canvas.addEventListener("mouseout", mouseUp, false);
canvas.addEventListener("mousemove", mouseMove, false);

/*=================== Drawing =================== */

var THETA = 0.5, PHI = 0.7;
var time_old = 0;

var animate = function(time) {
   var dt = time-time_old;

   if (!drag) {
      dX *= AMORTIZATION, dY*=AMORTIZATION;
      THETA+=dX, PHI+=dY;
   }

  mdl_mtx = _m_i /* model matrix */

  mdl_mtx = rotateY(mdl_mtx, THETA);
  mdl_mtx = rotateX(mdl_mtx, PHI);

   time_old = time; 
   gl.enable(gl.DEPTH_TEST);
   gl.clearColor(0, 0, 0, 1);
   gl.clearDepth(1.0);
   gl.viewport(0.0, 0.0, canvas.width, canvas.height);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   gl.uniformMatrix4fv(_Pmtx, false, prj_mtx);
   gl.uniformMatrix4fv(_Vmtx, false, vw_mtx);
   gl.uniformMatrix4fv(_Mmtx, false, mdl_mtx);

   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
   gl.drawElements(gl.TRIANGLES, C_I.length, gl.UNSIGNED_SHORT, 0);

   requestAnimationFrame(animate);
}
animate(0);