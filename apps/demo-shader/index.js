// Vertex shader is completely unrelated in this demo,
// so I decided to squeeze it to single line
var vertex_shader_code = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0,1);}'
var julia_shader_source = 
  'precision highp float;' +
  // canvas size ansd center point
  'uniform vec2 cs,cp;' +
  // scale
  'uniform float s;' +
  // mouse position
  'uniform vec2 m;' +
  //complex multiplication
  'vec2 cm(vec2 a, vec2 b) { return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x); }' +
`
#define MI 1000
#define MD 255.0

//conversion helper
float f(float n, vec3 hsl){
    float k = mod(n+hsl.x*12., 12.);
    float a = hsl.y*min(hsl.z, 1.-hsl.z);
    return hsl.z-a*max(min(k-3., min(9.-k, 1.)),-1.);
}
// hsl in range <0, 1>^3
vec3 hsl2rgb(vec3 hsl){
    return vec3(f(0.,hsl), f(8.,hsl), f(4.,hsl));
}

vec3 pc(vec2 tex, vec2 c) {
  float maxdist = 0.0;
  vec2 z = tex;
  float d;
  for(int i=0;i<MI;i++){
    z = cm(z,z) + c;
    d = length(z);
    if (maxdist < d) {
      maxdist = d;
    }
    if (maxdist > MD) {
      float d1 = sqrt((float(i) - log2(log(d) / log(sqrt(MD))) + 1.)/log2(float(MI*MI)));
      return hsl2rgb(vec3(0.8-d1/10.0, 1.0-d1, d1/2.0));
    }
  }
  float d1 = d/maxdist; d1=d1*d1;d1=d1*d1;d1=d1*d1;d1=d1*d1;
  return hsl2rgb(vec3(0.8-d1/3.0,0.5+d1/2.0,d1/4.0+0.25));
}

void main(){
  vec2 t=(gl_FragCoord.xy/cs.xy)*2.0-vec2(1.0,1.0);
  t.x=t.x*cs.x/cs.y;
  t=t*s+cp;
  vec2 c = m; //-vec2(1.0,1.0);
  // vec2 c=(m.xy/cs.xy)*2.0-vec2(1.0,1.0);
  // c.x=c.x*cs.x/cs.y;
  // c.y=-c.y;
  // c=c*s+cp;
  float dot=s*0.01/length(c-t);
  if (length(c-t) < 0.01*s) {
    gl_FragColor=vec4(1.0,1.0,1.0,1.0);  
    return;
  }
  if (length(c-t) > 0.01*s && length(c-t) < 0.015*s) {
    gl_FragColor=vec4(0.0,0.0,0.0,1.0);  
    return;
  }
  //vec2 c = vec2(0.27, -0.57);
  //c = vec2(0.295, 0.5727);
  // +hsl2rgb(vec3(dot/10.0,1.0,dot))
  gl_FragColor=vec4(pc(t, c), 1.0);
}
`

var fragment_shader_code = julia_shader_source;

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

  var compiled = WEBGL.getShaderParameter(shader, WEBGL.COMPILE_STATUS);
  if (!compiled) {
    console.log(WEBGL.getShaderInfoLog(shader));
  }

  WEBGL.attachShader(program, shader);
	return shader;
};

var canvas = document.getElementById('c');
var WEBGL = canvas.getContext('webgl');
var CANVAS_WIDTH = canvas.width = window.innerWidth;
var CANVAS_HEIGHT = canvas.height = window.innerHeight;
var current_center_x = 0;
var current_center_y = 0;
var current_zoom = 2.0;
var target_center_x = 0;
var target_center_y = 0;
var target_zoom = 2.0;
var current_const_x = 0.0, current_const_y = 0.0;
var current_mouse_x = 0.0, current_mouse_y = 0.0;
var pan_screen_mx = 0.0, pan_screen_my = 0.0;
var pan_tex_cx = 0.0, pan_tex_cy = 0.0;
var mouse_buttons_pressed = 0;

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
var param_center = webgl_get_uniform_location(program, 'cp');
var param_scale = webgl_get_uniform_location(program, 's');
var param_m = webgl_get_uniform_location(program, 'm');
WEBGL.enableVertexAttribArray(param_position);
WEBGL.vertexAttribPointer(param_position, 2, WEBGL.FLOAT, false, 0, 0);

var event_coords = (e) => {
  var bounds = canvas.getBoundingClientRect();
  var x = current_center_x + current_zoom * (2*(e.clientX - bounds.left)/bounds.width - 1)*bounds.width/bounds.height;
  var y = current_center_y + current_zoom * (2*(bounds.bottom - e.clientY - bounds.top)/bounds.height - 1);
  return [x, y];
}
canvas.onmousedown = (event) => {
  mouse_buttons_pressed++;
  if (mouse_buttons_pressed == 1) {
    pan_screen_mx = event.clientX;
    pan_screen_my = event.clientY;
    pan_tex_cx = current_center_x;
    pan_tex_cy = current_center_y;
  }
};
canvas.onmouseup = () => {
  mouse_buttons_pressed--;
};
canvas.onmousemove = (event) => {
  [current_mouse_x, current_mouse_y] = event_coords(event);
  if (mouse_buttons_pressed > 0) {
    if (Math.abs(current_mouse_x-current_const_x) < current_zoom*0.01 &&
        Math.abs(current_mouse_y-current_const_y) < current_zoom*0.01) {
          [current_const_x, current_const_y] = event_coords(event);
    } else {
      current_center_x = target_center_x = pan_tex_cx - (event.clientX - pan_screen_mx)/canvas.height*current_zoom*2;
      current_center_y = target_center_y = pan_tex_cy + (event.clientY - pan_screen_my)/canvas.height*current_zoom*2;
    }
  }
  request_animation_frame();
};
canvas.onwheel = (e) => {
  var _left  = current_center_x + current_zoom * (-1) * canvas.width/canvas.height;
  var _right = current_center_x + current_zoom * (1) * canvas.width/canvas.height;
  var _top    = current_center_y + current_zoom * (-1);
  var _bottom = current_center_y + current_zoom * (1);
  var z = -e.deltaY*0.001;  
  _left += (current_mouse_x - _left) * z;
  _right += (current_mouse_x - _right) * z;
  _top += (current_mouse_y - _top) * z;
  _bottom += (current_mouse_y - _bottom) * z;
  target_zoom = (_bottom - _top) / 2.0;
  target_center_x = (_right + _left) / 2.0;
  target_center_y = (_top + _bottom) / 2.0;
  request_animation_frame();
}


var floats_not_equal = (a, b) => (Math.abs(a-b) > 0.000001);
var refresh_canvas = () => {
  // as wordy as this looks - converting it to function won't save space
  WEBGL.uniform2f(param_canvas_size, CANVAS_WIDTH, CANVAS_HEIGHT);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform2f(param_m, current_const_x, current_const_y);
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
