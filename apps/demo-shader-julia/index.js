// Vertex shader is completely unrelated in this demo,
// so I decided to squeeze it to single line
var vertex_shader_code = 'attribute vec2 pos;void main(){gl_Position=vec4(pos,0,1);}'
var fragment_shader_code =
  'precision highp float;' +
  // canvas size ansd center point
  'uniform vec2 cs,cp;' +
  // scale
  'uniform float s;' +
  // complex constant (the iterated one) position
  'uniform vec2 c;' +
  //complex multiplication
  'vec2 cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);} ' +
  // max iterations
  'const int MI=500;' +
  // max (bailout) distance)
  'const float MD=1e8;' +
  // hsl converter, makes it easy to get smooth color transition
  'float f(float n,vec3 hsl){' +
  'float k=mod(n+hsl.x*12.,12.);' +
  'float a=hsl.y*min(hsl.z,1.-hsl.z);' +
  'return hsl.z-a*max(min(k-3.,min(9.-k, 1.)),-1.);' +
  '}' +
  'vec3 hsl2rgb(vec3 hsl){' +
  'return vec3(f(0.,hsl),f(8.,hsl),f(4.,hsl));' +
  '}' +
  // pixel color function
  // inputs are complex coordinates of texture pixel t and complex constant c
  'vec3 pc(vec2 t,vec2 c){' +
  'float maxdist = 0.0;' +
  'vec2 z=t;' +
  'float d;' +
  'for(int i=0;i<MI;i++){' +
  'z=cm(z,z)+c;' +
  'd=length(z);' +
  'if (maxdist<d){maxdist=d;}' +
  'if (maxdist>MD){' +
  // external coloring
  'float d1 = sqrt((float(i)-log2(log(d)/log(sqrt(MD)))+1.)/log2(float(MI*MI)));' +
  'return hsl2rgb(vec3(1.0-d1/5.0,1.0-d1,0.1+d1/3.0));' +
  '}' +
  '}' +
  // internal coloring
  'float d1=d/maxdist;d1=d1*d1;d1=d1*d1;d1=d1*d1;d1=d1*d1;' +
  'return hsl2rgb(vec3(0.8-d1/3.0,0.5+d1/2.0,d1/4.0+0.25));' +
  '}' +
  // imaging function
  'void main(){' +
  // t - coordinates of pixel on complex plane
  'vec2 t=(gl_FragCoord.xy/cs.xy)*2.0-vec2(1.0,1.0);' +
  't.x=t.x*cs.x/cs.y;' +
  't=t*s+cp;' +
  // draw current complex const position as white dot
  'float D=length(c-t)/s;' +
  'if (D<0.015){' +
  'D=(D<0.01?1.0:0.0);' +
  'gl_FragColor=vec4(D,D,D,1.0);' +
  '}else{' +
  // draw everything else with julia set
  'gl_FragColor=vec4(pc(t, c), 1.0);' +
  '}' +
  '}'

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
var to_fixed = (x) => { return x.toFixed(5); }

var canvas = document.getElementById('c');
var help = document.getElementById('h');
var WEBGL = canvas.getContext('webgl');
var current_center_x = 0;
var current_center_y = 0;
var current_zoom = 2.0;
var current_const_x = 0.0, current_const_y = 0.0;
var current_mouse_x = 0.0, current_mouse_y = 0.0;
var pan_screen_mx = 0.0, pan_screen_my = 0.0;
var pan_tex_cx = 0.0, pan_tex_cy = 0.0;
var mouse_buttons_pressed = 0;
var mouse_dragging_const = false;

var vertexPosBuffer = WEBGL.createBuffer();
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
var param_complex_constant = webgl_get_uniform_location(program, 'c');
WEBGL.enableVertexAttribArray(param_position);
WEBGL.vertexAttribPointer(param_position, 2, WEBGL.FLOAT, false, 0, 0);

var event_complex_coords = (event) => {
  var bounds = canvas.getBoundingClientRect();
  var event_x = current_center_x + current_zoom * (2*(event.clientX - bounds.left)/bounds.width - 1)*bounds.width/bounds.height;
  var event_y = current_center_y + current_zoom * (2*(bounds.bottom - event.clientY - bounds.top)/bounds.height - 1);
  return [event_x, event_y];
}
canvas.onmousedown = (event) => {
  mouse_buttons_pressed++;
  if (mouse_buttons_pressed == 1) {
    pan_screen_mx = event.clientX;
    pan_screen_my = event.clientY;
    pan_tex_cx = current_center_x;
    pan_tex_cy = current_center_y;
    var event_x, event_y;
    [event_x, event_y] = event_complex_coords(event);
    if (Math.abs(event_x - current_const_x) < 0.02 &&
        Math.abs(event_y - current_const_y) < 0.02) {
          mouse_dragging_const = true;
    }
  }
};
canvas.onmouseup = () => {
  mouse_buttons_pressed--;
  if (mouse_buttons_pressed == 0) {
    mouse_dragging_const = false;
  }
};
canvas.onmousemove = (event) => {
  [current_mouse_x, current_mouse_y] = event_complex_coords(event);
  if (mouse_buttons_pressed > 0) {
    if (mouse_dragging_const){
      current_const_x = current_mouse_x;
      current_const_y = current_mouse_y;
    } else {
      current_center_x = pan_tex_cx - (event.clientX - pan_screen_mx)/canvas.height*current_zoom*2;
      current_center_y = pan_tex_cy + (event.clientY - pan_screen_my)/canvas.height*current_zoom*2;
    }
    request_animation_frame();
  }
};
canvas.onwheel = (e) => {
  // TODO: simplify this.
  // This is probably the ugliest part of code,
  // eating a whopping 167 (!!!) bytes of final package.
  // Zooms image in such a way that
  // mouse keeps pointing to same image coordinates.
  var _left  = current_center_x + current_zoom * (-1) * canvas.width/canvas.height;
  var _right = current_center_x + current_zoom * (1) * canvas.width/canvas.height;
  var _top    = current_center_y + current_zoom * (-1);
  var _bottom = current_center_y + current_zoom * (1);
  var z = -e.deltaY*0.0025;  
  _left += (current_mouse_x - _left) * z;
  _right += (current_mouse_x - _right) * z;
  _top += (current_mouse_y - _top) * z;
  _bottom += (current_mouse_y - _bottom) * z;
  current_zoom = (_bottom - _top) / 2.0;
  current_center_x = (_right + _left) / 2.0;
  current_center_y = (_top + _bottom) / 2.0;
  request_animation_frame();
}

var refresh_canvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  WEBGL.viewport(0, 0, canvas.width, canvas.height);
  // as wordy as this looks - converting it to function won't save space
  WEBGL.uniform2f(param_canvas_size, canvas.width, canvas.height);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform2f(param_complex_constant, current_const_x, current_const_y);
  WEBGL.uniform1f(param_scale, current_zoom);
  WEBGL.drawArrays(WEBGL.TRIANGLE_STRIP, 0, 4);
  help.innerHTML = [
      'Center: ' + to_fixed(current_center_x) + ',' + to_fixed(current_center_y),
      'Constant: ' + to_fixed(current_const_x) + ',' + to_fixed(current_const_y),
      'Zoom: ' + to_fixed(current_zoom)
    ].join('<br/>')
}
window.onresize = request_animation_frame;
request_animation_frame();
