var shader_v = `
attribute vec2 pos;
void main() {
  gl_Position = vec4(pos, 0, 1);
}
`
var shader_f = `
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
  gl_FragColor = calc(texCoord);
}
`

function createShader(str, type) {
	var shader = WEBGL.createShader(type);
	WEBGL.shaderSource(shader, str);
	WEBGL.compileShader(shader);
	if (!WEBGL.getShaderParameter(shader, WEBGL.COMPILE_STATUS)) {
		throw WEBGL.getShaderInfoLog(shader);
	}
	return shader;
}

function createProgram(vstr, fstr) {
	var program = WEBGL.createProgram();
	var vshader = createShader(vstr, WEBGL.VERTEX_SHADER);
	var fshader = createShader(fstr, WEBGL.FRAGMENT_SHADER);
	WEBGL.attachShader(program, vshader);
	WEBGL.attachShader(program, fshader);
	WEBGL.linkProgram(program);
	if (!WEBGL.getProgramParameter(program, WEBGL.LINK_STATUS)) {
		throw WEBGL.getProgramInfoLog(program);
	}
	return program;
}

function linkProgram(program) {
	var vshader = createShader(program.vshaderSource, WEBGL.VERTEX_SHADER);
	var fshader = createShader(program.fshaderSource, WEBGL.FRAGMENT_SHADER);
	WEBGL.attachShader(program, vshader);
	WEBGL.attachShader(program, fshader);
	WEBGL.linkProgram(program);
	if (!WEBGL.getProgramParameter(program, WEBGL.LINK_STATUS)) {
		throw WEBGL.getProgramInfoLog(program);
	}
}

var canvas = document.getElementById('c');
var WEBGL = canvas.getContext('webgl');
var current_center_x = -0.5;
var current_center_y = 0;
var current_zoom = 1.35;
var target_center_x = -0.5;
var target_center_y = 0;
var target_zoom = 1.35;


var vertexPosBuffer = WEBGL.createBuffer();
WEBGL.bindBuffer(WEBGL.ARRAY_BUFFER, vertexPosBuffer);
WEBGL.bufferData(WEBGL.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), WEBGL.STATIC_DRAW);

var program = createProgram(shader_v,shader_f);
WEBGL.useProgram(program);
var param_position = WEBGL.getAttribLocation(program, 'pos');
var param_canvas_size = WEBGL.getUniformLocation(program, 'cs');
var param_center = WEBGL.getUniformLocation(program, 'c');
var param_Scale = WEBGL.getUniformLocation(program, 's');

WEBGL.enableVertexAttribArray(param_position);
WEBGL.vertexAttribPointer(param_position, 2, WEBGL.FLOAT, false, 0, 0);

window.onkeydown = function(e) {
  var kc = e.keyCode;
  // 37 = cursor left
  // 39 = cursor right
  target_center_x += 0.1*current_zoom*((kc==39) - (kc==37));
  // 38 = cursor up
  // 40 = cursor up
  target_center_y += 0.1*current_zoom*((kc==38) - (kc==40));
  // 107 = +
  // 109 = -
  target_zoom *= 1 + 0.1*((kc==109) - (kc==107))
  requestAnimationFrame(draw)
};


function draw() {
  var not_eqal = (a, b) => (Math.abs(a-b) > 0.001);
  WEBGL.uniform2f(param_canvas_size, canvas.width, canvas.height);
  WEBGL.uniform2f(param_center, current_center_x, current_center_y);
  WEBGL.uniform1f(param_Scale, current_zoom);
  WEBGL.drawArrays(WEBGL.TRIANGLE_STRIP, 0, 4);

  if (not_eqal(current_center_x, target_center_x) || 
      not_eqal(current_center_y, target_center_y) || 
      not_eqal(current_zoom, target_zoom)) {
    current_center_x += (target_center_x - current_center_x) * .1;
    current_center_y += (target_center_y - current_center_y) * .1;
    current_zoom += (target_zoom - current_zoom) * .1;
    requestAnimationFrame(draw)    
  }
}

requestAnimationFrame(draw)
draw();