var vertex_shader_code = `
attribute vec2 pos;
void main() {
  gl_Position = vec4(pos, 0, 1);
}
`
var fragment_shader_code = `
precision highp float;
precision mediump int;
uniform vec2 cs;
uniform vec2 c;
uniform float s;

vec4 calc(vec2 texCoord) {
  float x = 0.0;
  float y = 0.0;
  float v = 10000.0;
  float j = 10000.0;
  for (int iteration = 0; iteration < 100; ++iteration) {
    float xtemp = x*x-y*y+texCoord.x;
    y = 2.0*x*y+texCoord.y;
    x = xtemp;
    v = min(v, abs(x*x+y*y));
    j = min(j, abs(x*y));
    if (x*x+y*y >= 8.0) {
      float d = (float(iteration) - (log(log(sqrt(x*x+y*y))) / log(2.0))) / 50.0;
      v = (1.0 - v) / 2.0;
      j = (1.0 - j) / 2.0;
      return vec4(d+j,d,d+v,1);
    }
  }
  return vec4(0,0,0,1);
}

void main() {
  vec2 texCoord = (gl_FragCoord.xy / cs.xy) * 2.0 - vec2(1.0,1.0);
  texCoord = texCoord * s + c;
  texCoord.x = texCoord.x * cs.x / cs.y;
  gl_FragColor = calc(texCoord);
}
`
// Shortcuts to save javascript size.
// These contain function names that are too long.
var request_animation_frame = () => { requestAnimationFrame(refresh_canvas); };
var not_eqal = (a, b) => (Math.abs(a-b) > 0.001);
var webgl_get_uniform_location = (program, param_name) => {
  return WEBGL.getUniformLocation(program, param_name);
};
var attach_shader_to_webgl = (program, shader_source, shader_tupe) => {
	var shader = WEBGL.createShader(shader_tupe);
	WEBGL.shaderSource(shader, shader_source);
	WEBGL.compileShader(shader);
  WEBGL.attachShader(program, shader);
	return shader;
};

var canvas = document.getElementById('c');
var WEBGL = canvas.getContext('webgl');
var CANVAS_WIDTH = canvas.width = window.innerWidth;
var CANVAS_HEIGHT = canvas.height = window.innerHeight;
var current_center_x = -0.5;
var current_center_y = 0;
var current_zoom = 3.;
var target_center_x = -0.5;
var target_center_y = 0;
var target_zoom = 1.;
var param_position;

var vertexPosBuffer = WEBGL.createBuffer();
WEBGL.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
WEBGL.bindBuffer(WEBGL.ARRAY_BUFFER, vertexPosBuffer);
WEBGL.bufferData(WEBGL.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), WEBGL.STATIC_DRAW);

var program = WEBGL.createProgram();
attach_shader_to_webgl(program, vertex_shader_code, WEBGL.VERTEX_SHADER);
attach_shader_to_webgl(program, fragment_shader_code, WEBGL.FRAGMENT_SHADER);
WEBGL.linkProgram(program);
WEBGL.useProgram(program);
var param_position = WEBGL.getAttribLocation(program, 'pos');
var param_canvas_size = webgl_get_uniform_location(program, 'cs');
var param_center = webgl_get_uniform_location(program, 'c');
var param_scale = webgl_get_uniform_location(program, 's');
WEBGL.enableVertexAttribArray(param_position);
WEBGL.vertexAttribPointer(param_position, 2, WEBGL.FLOAT, false, 0, 0);

window.onkeydown = function(event) {
  var key_code = event.keyCode;
  // 37 = cursor left
  // 39 = cursor right
  target_center_x += 0.1*current_zoom*((key_code==39) - (key_code==37));
  // 38 = cursor up
  // 40 = cursor up
  target_center_y += 0.1*current_zoom*((key_code==38) - (key_code==40));
  // 107 = +
  // 109 = -
  target_zoom *= 1 + 0.1*((key_code==109) - (key_code==107));
  request_animation_frame();
};

var refresh_canvas = () => {
  WEBGL.uniform2f(param_canvas_size, CANVAS_WIDTH, CANVAS_HEIGHT);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform1f(param_scale, current_zoom);
  WEBGL.drawArrays(WEBGL.TRIANGLE_STRIP, 0, 4);

  if (not_eqal(current_center_x, target_center_x) || 
      not_eqal(current_center_y, target_center_y) || 
      not_eqal(current_zoom, target_zoom)) {
    current_center_x += (target_center_x - current_center_x) * .1;
    current_center_y += (target_center_y - current_center_y) * .1;
    current_zoom += (target_zoom - current_zoom) * .1;
    request_animation_frame();
  }
}
request_animation_frame();
