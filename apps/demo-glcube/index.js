/* Cube geometry */
/* vertex coordinates */
var C_V = [
  -1,-1,-1,   1,-1,-1,   1, 1,-1,   -1, 1,-1,
  -1,-1, 1,   1,-1, 1,   1, 1, 1,   -1, 1, 1,
  -1,-1,-1,  -1, 1,-1,  -1, 1, 1,   -1,-1, 1,
   1,-1,-1,   1, 1,-1,   1, 1, 1,    1,-1, 1,
  -1,-1,-1,  -1,-1, 1,   1,-1, 1,    1,-1,-1,
  -1, 1,-1,  -1, 1, 1,   1, 1, 1,    1, 1,-1, 
];
/* vertex colors */
var CUBE_COLOR = [
  0,0,1, 0,0,1, 0,0,1, 0,0,1,
  0,1,1, 0,1,1, 0,1,1, 0,1,1,
  1,0,0, 1,0,0, 1,0,0, 1,0,0,
  1,0,1, 1,0,1, 1,0,1, 1,0,1,
  1,1,0, 1,1,0, 1,1,0, 1,1,0,
  1,1,1, 1,1,1, 1,1,1, 1,1,1 
];
/* triangle vertex indices */
var CUBE_INDEX = [
  0,1,2, 0,2,3, 4,5,6, 4,6,7,
  8,9,10, 8,10,11, 12,13,14, 12,14,15,
  16,17,18, 16,18,19, 20,21,22, 20,22,23 
];

/* shortcuts */

var _cos = (a) => Math.cos(a)
var _sin = (a) => Math.sin(a)

/* predefined matrices */

var _get_matrix_identity = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
   ]

var _get_matrix_rotate_x = (a) => [
   1,     0,      0, 0,
   0, _cos(a), -_sin(a), 0,
   0, _sin(a),  _cos(a), 0,
   0,     0,      0, 1
];

var _get_matrix_rotate_y = (a) => [
    _cos(a), 0, _sin(a), 0,
        0, 1,     0, 0,
   -_sin(a), 0, _cos(a), 0,
        0, 0,     0, 1
];
 
var _get_matrix_rotate_z = (a) => [
   _Mc(a), -_Ms(a), 0, 0,
   _Mc(a),  _Ms(a), 0, 0,
        0,       0, 1, 0,
        0,       0, 0, 1
];

 /* matrix operations */
 
/* multiply 4-element matrix by vector */
var matrix_multiply_MV = (m, v) => [
    (v[0] * m[ 0]) + (v[1] * m[ 4]) + (v[2] * m[ 8]) + (v[3] * m[12]),
    (v[0] * m[ 1]) + (v[1] * m[ 5]) + (v[2] * m[ 9]) + (v[3] * m[13]),
    (v[0] * m[ 2]) + (v[1] * m[ 6]) + (v[2] * m[10]) + (v[3] * m[14]),
    (v[0] * m[ 3]) + (v[1] * m[ 7]) + (v[2] * m[11]) + (v[3] * m[15])
]

/* multiply two 4-element matrices */
var matrix_multiply_MM = (a, b) => Array().concat(
    matrix_multiply_MV(a, [b[ 0], b[ 1], b[ 2], b[ 3]]),
    matrix_multiply_MV(a, [b[ 4], b[ 5], b[ 6], b[ 7]]),
    matrix_multiply_MV(a, [b[ 8], b[ 9], b[10], b[11]]),
    matrix_multiply_MV(a, [b[12], b[13], b[14], b[15]])
);

/* rotate matrix m by angle a along X */
var matrix_rotate_x = (m, a) => matrix_multiply_MM(m, _get_matrix_rotate_x(a));

/* rotate matrix m by angle a along Y */
var matrix_rotate_y = (m, a) => matrix_multiply_MM(m, _get_matrix_rotate_y(a));

var canvas = document.getElementById('gl');
var CANVAS_WIDTH = canvas.width = window.innerWidth;
var CANVAS_HEIGHT = canvas.height = window.innerHeight;
var GL_CTX = canvas.getContext('webgl');

var _create_buffer = (gl_type, data_array) => {
  var b = GL_CTX.createBuffer();
  GL_CTX.bindBuffer(gl_type, b);
  GL_CTX.bufferData(gl_type, data_array, GL_CTX.STATIC_DRAW);
  return b;
}
var BUF_V = _create_buffer(GL_CTX.ARRAY_BUFFER, new Float32Array(C_V));
var BUF_C = _create_buffer(GL_CTX.ARRAY_BUFFER, new Float32Array(CUBE_COLOR));
var BUF_I = _create_buffer(GL_CTX.ELEMENT_ARRAY_BUFFER, new Uint16Array(CUBE_INDEX));

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

var shader_program = GL_CTX.createProgram();
var _new_shader = (shader_type, shader_code) => {
  _shd = GL_CTX.createShader(shader_type);
  GL_CTX.shaderSource(_shd, shader_code);
  GL_CTX.compileShader(_shd);
  GL_CTX.attachShader(shader_program, _shd);
  return _shd;
}
_new_shader(GL_CTX.VERTEX_SHADER, vertCode);
_new_shader(GL_CTX.FRAGMENT_SHADER, fragCode);
GL_CTX.linkProgram(shader_program);

var shader_param_matrix = GL_CTX.getUniformLocation(shader_program, "m");

var _bind_buffer = (buffer, variable_name) => {
  GL_CTX.bindBuffer(GL_CTX.ARRAY_BUFFER, buffer);
  _z = GL_CTX.getAttribLocation(shader_program, variable_name);
  GL_CTX.vertexAttribPointer(_z, 3, GL_CTX.FLOAT, false, 0, 0);
  GL_CTX.enableVertexAttribArray(_z);
}
_bind_buffer(BUF_V, "p");
_bind_buffer(BUF_C, "c");

GL_CTX.useProgram(shader_program);

var _get_projection_matrix = (view_angle, aspect_ratio, zMin, zMax) => {
  var ang = Math.tan((view_angle)*3.14/360); // Math.tan((angle*.5)*Math.PI/180);
  return [
      0.5/ang,                   0,                          0,   0,
            0,  aspect_ratio/ang/2,                          0,   0,
            0,                   0,   -(zMax+zMin)/(zMax-zMin),  -1,
            0,                   0, (-2*zMax*zMin)/(zMax-zMin),   0 
    ];
}
var matrix_projection = _get_projection_matrix(40, CANVAS_WIDTH/CANVAS_HEIGHT, 1, 100);
var matrix_model = _get_matrix_identity
var matrix_view = _get_matrix_identity
matrix_view[14] = -3; /* -5 units back off zero so we can see origin */

var cube_rotation_angle = 0;

var animation = () => {
  matrix_model = _get_matrix_identity

  matrix_model = matrix_rotate_y(matrix_model, cube_rotation_angle);
  matrix_model = matrix_rotate_x(matrix_model, -cube_rotation_angle);

   GL_CTX.enable(GL_CTX.DEPTH_TEST);
   GL_CTX.clearColor(0, 0, 0, 1);
   GL_CTX.clearDepth(1.0);
   GL_CTX.viewport(0.0, 0.0, CANVAS_WIDTH, CANVAS_HEIGHT);
   GL_CTX.clear(GL_CTX.COLOR_BUFFER_BIT | GL_CTX.DEPTH_BUFFER_BIT);

   GL_CTX.uniformMatrix4fv(shader_param_matrix, false, matrix_multiply_MM(matrix_projection,matrix_multiply_MM(matrix_view, matrix_model)));

   GL_CTX.bindBuffer(GL_CTX.ELEMENT_ARRAY_BUFFER, BUF_I);
   GL_CTX.drawElements(GL_CTX.TRIANGLES, CUBE_INDEX.length, GL_CTX.UNSIGNED_SHORT, 0);

   cube_rotation_angle += 0.01;

   requestAnimationFrame(animation);
}
animation();