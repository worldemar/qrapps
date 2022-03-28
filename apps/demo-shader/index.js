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
	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw gl.getShaderInfoLog(shader);
	}
	return shader;
}

function createProgram(vstr, fstr) {
	var program = gl.createProgram();
	var vshader = createShader(vstr, gl.VERTEX_SHADER);
	var fshader = createShader(fstr, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
}

function screenQuad() {
	var vertexPosBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
	var vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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
	var vshader = createShader(program.vshaderSource, gl.VERTEX_SHADER);
	var fshader = createShader(program.fshaderSource, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
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
	var program = gl.createProgram();
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

var c = document.getElementById('c');
var gl = c.getContext('webgl');
var offset = [-0.5, 0];
var scale = 1.35;
var actions = {};
var keyMappings = { 
    '37' : 'panleft',
    '38' : 'panup',
    '39' : 'panright',
    '40' : 'pandown',
    '90' : 'zoomin',
    '88' : 'zoomout'
  };
for (var k in keyMappings) {
  actions[keyMappings[k]] = false;
}
var vertexPosBuffer = screenQuad();

var program = createProgram(shader_v,shader_f);
gl.useProgram(program);
program.vertexPosAttrib = gl.getAttribLocation(program, 'pos');
program.cs = gl.getUniformLocation(program, 'cs');
program.o = gl.getUniformLocation(program, 'o');
program.s = gl.getUniformLocation(program, 's');
gl.enableVertexAttribArray(program.vertexPosAttrib);
gl.vertexAttribPointer(program.vertexPosAttrib, vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

window.onkeydown = function(e) {
  var kc = e.keyCode.toString();
  if (keyMappings.hasOwnProperty(kc)) {
    actions[keyMappings[kc]] = true;
      requestAnimationFrame(draw)
  }
};

window.onkeyup = function(e) {
  var kc = e.keyCode.toString();
  if (keyMappings.hasOwnProperty(kc)) {
    actions[keyMappings[kc]] = false;
  }
  for (var j in keyMappings) {
    if (actions[keyMappings[j]]) {
      return;
    }
  }
};

function draw() {
  offset[0] += -(actions.panleft ? scale / 25 : 0) + (actions.panright ? scale / 25 : 0);
  offset[1] += -(actions.pandown ? scale / 25 : 0) + (actions.panup ? scale / 25 : 0);
  scale = scale * (actions.zoomin ? 0.975 : 1.0) / (actions.zoomout ? 0.975 : 1.0);
  gl.uniform2f(program.cs, c.width, c.height);
  gl.uniform2f(program.o, offset[0], offset[1]);
  gl.uniform1f(program.s, scale);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexPosBuffer.numItems);
  for (var k in keyMappings) {
    actions[keyMappings[k]] = false;
  }
}

requestAnimationFrame(draw)
draw();