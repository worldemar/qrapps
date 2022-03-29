// Vertex shader is completely unrelated in this demo,
// so I decided to squeeze it to single line
var vertex_shader_code = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0,1);}'
var fragment_shader_code = 
'precision highp float;' +
// canvas size ansd center
'uniform vec2 cs,c;' +
// scale
'uniform float s;' +

'vec4 calc(vec2 tex){' +
  'float x=.0,y=.0;' +
  'float v=1e5,j=1e5;' +

  'for(int it=0;it<1000;++it){' +

  // complex iterator
    'float _x=x*x-y*y+tex.x;' +
    'y=2.0*x*y+tex.y;' +
    'x=_x;' +

    // these are only used for coloring
    'v=min(v,abs(x*x+y*y));' +
    'j=min(j,abs(x*y));' + 

    // stop condition
    'if (x*x+y*y>=9.0) {' +
      // external (conventional) coloring
      'float d=(float(it)-(log(log(sqrt(x*x+y*y)))/log(2.0)))/50.0;' +
      'v=(1.0-v)/10.0;' +
      'j=(1.0-j)/2.0;' +
      'return vec4(d+j,d+v,d,1);' +
    '}' +
  '}' +
  // internal coloring
  'v=2.0/log(v);' +
  'return vec4(v*v,v*v*v,v*v*v*v,1);' +
'}' +

'void main(){' +
  'vec2 tex=(gl_FragCoord.xy/cs.xy)*2.0-vec2(1.0,1.0);' +
  'tex.x=tex.x*cs.x/cs.y;' +
  'tex=tex*s+c;' +
  'gl_FragColor=calc(tex);' +
'}';

// Shortcuts to save javascript size.
// These contain function names that are too long.
var request_animation_frame = () => {
  requestAnimationFrame(refresh_canvas);
};
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

var vertexPosBuffer = WEBGL.createBuffer();
WEBGL.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
var WEBGL_ARRAY_BUFFER = WEBGL.ARRAY_BUFFER;
WEBGL.bindBuffer(WEBGL_ARRAY_BUFFER, vertexPosBuffer);
WEBGL.bufferData(WEBGL_ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), WEBGL.STATIC_DRAW);

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

var floats_not_equal = (a, b) => (Math.abs(a-b) > 0.000001);
var refresh_canvas = () => {
  // as wordy as this looks - converting it to function won't save space
  WEBGL.uniform2f(param_canvas_size, CANVAS_WIDTH, CANVAS_HEIGHT);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform1f(param_scale, current_zoom);
  WEBGL.drawArrays(WEBGL.TRIANGLE_STRIP, 0, 4);
  // this look very long, but thanks to function above compresses incredibly well
  if (floats_not_equal(current_center_x, target_center_x) || 
      floats_not_equal(current_center_y, target_center_y) || 
      floats_not_equal(current_zoom, target_zoom)) {
        current_center_x += (target_center_x - current_center_x) * .1;
        current_center_y += (target_center_y - current_center_y) * .1;
        current_zoom += (target_zoom - current_zoom) * .1;
        request_animation_frame();
  }
}
request_animation_frame();
