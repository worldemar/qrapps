// Vertex shader is completely unrelated in this demo,
// so I decided to squeeze it to single line
var vertex_shader_code = 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}'
var fragment_shader_code =
  'precision highp float;' +
  // canvas size ansd center point
  'uniform vec2 cs,cp;' +
  // scale
  'uniform float s;' +
  // complex constant (the iterated one) position
  'uniform vec2 c;' +
  // complex constant dot size
  'uniform float ds;' +
  //complex multiplication
  'vec2 cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);} ' +
  // max iterations
  'const int I=254;' +
  // hsl converter, makes it easy to get smooth color transition
  'float f(float n,vec3 hsl){' +
  'float k=mod(n+hsl.x*12.,12.);' +
  'float a=hsl.y*min(hsl.z,1.-hsl.z);' +
  'return hsl.z-a*max(min(k-3.,min(9.-k, 1.)),-1.);' +
  '}' +
  'vec3 C(vec3 hsl){' +
  'return vec3(f(0.,hsl),f(8.,hsl),f(4.,hsl));' +
  '}' +
  // pixel color function
  // inputs are complex coordinates of texture pixel t and complex constant c
  'vec3 pc(vec2 t,vec2 c){' +
  'float O=.0;' +
  'vec2 z=t;' +
  'float d;' +
  'for(int i=0;i<I;i++){' +
  'z=cm(z,z)+c;' +
  'd=length(z);' +
  'O=O<d?d:O;' +
  // 1e8 is max (bailout) distance)
  'if(O>1e8){' +
  // external coloring
  'float l=sqrt((float(i)-log2(log(d)/log(sqrt(1e8)))+1.)/log2(float(I*I)));' +
  'return C(vec3(1.-l/5.,1.-l,.1+l/3.));' +
  '}' +
  '}' +
  // internal coloring
  'float l=pow(d/O,16.);' +
  'return C(vec3(.8-l/3.,.5+l/2.,l/4.+.25));' +
  '}' +
  // imaging function
  'void main(){' +
  // t - coordinates of pixel on complex plane
  'vec2 t=(gl_FragCoord.xy/cs.xy)*2.-vec2(1.,1.);' +
  't.x=t.x*cs.x/cs.y;' +
  't=t*s+cp;' +
  // draw current complex const position as white dot
  'float D=length(c-t)/s;' +
  'if (D<ds){' +
  'D=(D<(ds-.005)?1.:.0);' +
  'gl_FragColor=vec4(D,D,D,1.);' +
  '}else{' +
  // draw everything else with julia set
  'gl_FragColor=vec4(pc(t,c),1.);' +
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

  // uncomment this to debug shader errors
  // var compiled = WEBGL.getShaderParameter(shader, WEBGL.COMPILE_STATUS);
  // if (!compiled) {
  //   console.log(WEBGL.getShaderInfoLog(shader));
  // }

  WEBGL.attachShader(program, shader);
  return shader;
};
var to_fixed_width = (the_float) => { return the_float.toFixed(5); }
var event_coords = (event) => {
  var touch = event.touches.item(0);
  var bounds = canvas.getBoundingClientRect();
  var page_x = touch.pageX;
  var page_y = touch.pageY;
  var event_x = current_center_x +
    current_zoom * (2 * (page_x - bounds.left) / bounds.width - 1) * bounds.width / bounds.height;
  var event_y = current_center_y + 
    current_zoom * (2 * (bounds.height - page_y) / bounds.height - 1);
  return [page_x, page_y, event_x, event_y];
}

var initialize_zoom_button = (div_id, offset, scale) => {
  var zoom_div = document.getElementById(div_id);
  zoom_div.style.left = window.innerWidth-offset;
  zoom_div.ontouchstart = () => { current_zoom *= scale; request_animation_frame(); };
}
initialize_zoom_button('p', 190, 0.9);
initialize_zoom_button('m', 380, 1.1);

var canvas = document.getElementById('c');
var help = document.getElementById('h');
var WEBGL = canvas.getContext('webgl');
var current_center_x = 0.0;
var current_center_y = 0.0;
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
var param_position = WEBGL.getAttribLocation(program, 'p');
var param_canvas_size = webgl_get_uniform_location(program, 'cs');
var param_center = webgl_get_uniform_location(program, 'cp');
var param_scale = webgl_get_uniform_location(program, 's');
var param_complex_constant_size = webgl_get_uniform_location(program, 'ds');
var param_complex_constant = webgl_get_uniform_location(program, 'c');
WEBGL.enableVertexAttribArray(param_position);
WEBGL.vertexAttribPointer(param_position, 2, WEBGL.FLOAT, false, 0, 0);

canvas.ontouchstart = (event) => {
  event.preventDefault();
  mouse_buttons_pressed++;
  if (mouse_buttons_pressed == 1) {
    var complex_x, complex_y;
    [pan_screen_mx, pan_screen_my, complex_x, complex_y] = event_coords(event);
    pan_tex_cx = current_center_x;
    pan_tex_cy = current_center_y;
    if (Math.abs(complex_x - current_const_x) < 0.1 * current_zoom &&
        Math.abs(complex_y - current_const_y) < 0.1 * current_zoom) {
          mouse_dragging_const = true;
    }
  }
  request_animation_frame();
};
canvas.ontouchend = () => {
  mouse_buttons_pressed--;
  if (mouse_buttons_pressed == 0) {
    mouse_dragging_const = false;
  }
  request_animation_frame();
};
canvas.ontouchmove = (event) => {
  var screen_x, screen_y;
  [screen_x, screen_y, current_mouse_x, current_mouse_y] = event_coords(event);
  if (mouse_buttons_pressed > 0) {
    if (mouse_dragging_const){
      current_const_x = current_mouse_x;
      current_const_y = current_mouse_y;
    } else {
      var screen_scale = current_zoom * 2 / canvas.height;
      current_center_x = pan_tex_cx - (screen_x - pan_screen_mx)*screen_scale;
      current_center_y = pan_tex_cy + (screen_y - pan_screen_my)*screen_scale;
    }
    request_animation_frame();
  }
};

var refresh_canvas = () => {
  var canvas_width = canvas.width = window.innerWidth;
  var canvas_height = canvas.height = window.innerHeight;
  WEBGL.viewport(0, 0, canvas_width, canvas_height);
  // as wordy as this looks - converting it to function won't save space
  WEBGL.uniform2f(param_canvas_size, canvas_width, canvas_height);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform2f(param_complex_constant, current_const_x, current_const_y);
  WEBGL.uniform1f(param_complex_constant_size, mouse_dragging_const ? 0.1 : 0.015 );
  WEBGL.uniform1f(param_scale, current_zoom);
  WEBGL.drawArrays(WEBGL.TRIANGLE_STRIP, 0, 4);
  help.innerHTML = [
      'Center: ' + to_fixed_width(current_center_x) + ',' + to_fixed_width(current_center_y),
      'Constant: ' + to_fixed_width(current_const_x) + ',' + to_fixed_width(current_const_y),
      'Zoom: ' + to_fixed_width(current_zoom)
    ].join('<br/>')
}
window.onresize = request_animation_frame;
request_animation_frame();
