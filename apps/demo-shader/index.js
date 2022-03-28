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
uniform vec2 o;
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
  texCoord = texCoord * s + o;
  gl_FragColor = calc(texCoord);
}
`

function createShader(str, type) {
	var shader = webgl.createShader(type);
	webgl.shaderSource(shader, str);
	webgl.compileShader(shader);
	if (!webgl.getShaderParameter(shader, webgl.COMPILE_STATUS)) {
		throw webgl.getShaderInfoLog(shader);
	}
	return shader;
}

function createProgram(vstr, fstr) {
	var program = webgl.createProgram();
	var vshader = createShader(vstr, webgl.VERTEX_SHADER);
	var fshader = createShader(fstr, webgl.FRAGMENT_SHADER);
	webgl.attachShader(program, vshader);
	webgl.attachShader(program, fshader);
	webgl.linkProgram(program);
	if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) {
		throw webgl.getProgramInfoLog(program);
	}
	return program;
}

function screenQuad() {
	var vertexPosBuffer = webgl.createBuffer();
	webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexPosBuffer);
	var vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
	webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW);
	vertexPosBuffer.itemSize = 2;
	vertexPosBuffer.numItems = 4;

	/*
	 2___3
	 |\  |
	 | \ |
	 |__\|
	 0   1
	*/
	return vertexPosBuffer;
}

function linkProgram(program) {
	var vshader = createShader(program.vshaderSource, webgl.VERTEX_SHADER);
	var fshader = createShader(program.fshaderSource, webgl.FRAGMENT_SHADER);
	webgl.attachShader(program, vshader);
	webgl.attachShader(program, fshader);
	webgl.linkProgram(program);
	if (!webgl.getProgramParameter(program, webgl.LINK_STATUS)) {
		throw webgl.getProgramInfoLog(program);
	}
}

function loadFile(file, callback, noCache, isJson) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState == 1) {
			if (isJson) {
				request.overrideMimeType('application/json');
			}
			request.send();
		} else if (request.readyState == 4) {
			if (request.status == 200) {
				callback(request.responseText);
			} else if (request.status == 404) {
				throw 'File "' + file + '" does not exist.';
			} else {
				throw 'XHR error ' + request.status + '.';
			}
		}
	};
	var url = file;
	if (noCache) {
		url += '?' + (new Date()).getTime();
	}
	request.open('GET', url, true);
}

function loadProgram(vs, fs, callback) {
	var program = webgl.createProgram();
	function vshaderLoaded(str) {
		program.vshaderSource = str;
		if (program.fshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}
	function fshaderLoaded(str) {
		program.fshaderSource = str;
		if (program.vshaderSource) {
			linkProgram(program);
			callback(program);
		}
	}
	loadFile(vs, vshaderLoaded, true);
	loadFile(fs, fshaderLoaded, true);
	return program;
}

var canvas = document.getElementById('c');
var webgl = canvas.getContext('webgl');
var current_center_x = -0.5;
var current_center_y = 0;
var current_zoom = 1.35;
var target_center_x = -0.5;
var target_center_y = 0;
var target_zoom = 1.35;



var vertexPosBuffer = screenQuad();
var program = createProgram(shader_v,shader_f);
webgl.useProgram(program);
program.vertexPosAttrib = webgl.getAttribLocation(program, 'pos');
program.cs = webgl.getUniformLocation(program, 'cs');
program.o = webgl.getUniformLocation(program, 'o');
program.s = webgl.getUniformLocation(program, 's');
webgl.enableVertexAttribArray(program.vertexPosAttrib);
webgl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, webgl.FLOAT, false, 0, 0);

window.onkeydown = function(e) {
  var kc = e.keyCode.toString();
  // 37 = cursor left
  // 39 = cursor right
  target_center_x += 0.1*current_zoom*((kc=='39') - (kc=='37'));
  // 38 = cursor up
  // 40 = cursor up
  target_center_y += 0.1*current_zoom*((kc=='38') - (kc=='40'));
  // 107 = +
  // 109 = -
  target_zoom *= 1 + 0.1*((kc=='109') - (kc=='107'))
  requestAnimationFrame(draw)
};

not_eqal = (a, b) => (Math.abs(a-b) > 0.001)

function draw() {
  webgl.uniform2f(program.cs, canvas.width, canvas.height);
  webgl.uniform2f(program.o, current_center_x, current_center_y);
  webgl.uniform1f(program.s, current_zoom);
  webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);

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