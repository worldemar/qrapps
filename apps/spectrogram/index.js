var MAX_DISPLAY_FREQUENCY = 16000;
var body, canvas, canvas_context;
var current_line_data;
var CANVAS_WIDTH, CANVAS_HEIGHT;
var current_line;
var audio_ctx;
var audio_data;
var audio_analyser;

var init = () => {
  body = document.getElementsByTagName('body')[0]
  canvas = document.getElementsByTagName('canvas')[0]
  CANVAS_WIDTH = canvas.width = window.innerWidth;
  CANVAS_HEIGHT = canvas.height = window.innerHeight;
  current_line = CANVAS_HEIGHT / 2;
  canvas_context = canvas.getContext('2d');
  current_line_data = canvas_context.createImageData(CANVAS_WIDTH*4, 1);

  // initial clear
  canvas_context.fillStyle = 'black';
  canvas_context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (navigator.mediaDevices.getUserMedia) {
    var media_success_callback = (stream) => {
      audio_ctx = new AudioContext();
      // analyzer
      audio_analyser = audio_ctx.createAnalyser();
      audio_analyser.fftSize = 8192; // bigger = more precision
      audio_data = new Uint8Array(audio_analyser.frequencyBinCount);
      //source
      audio_ctx.createMediaStreamSource(stream).connect(audio_analyser);
      // start screen roll
      screen_update();
    }
    var media_error_callback = (err) => {
      alert(err);
    }
    navigator.mediaDevices.getUserMedia({audio: true}).then(
      media_success_callback, media_error_callback);
  }
}

// all inputs: 0-1
// all outputs: 0-255
function HSL2RGB(h, s, l) {
  var r, g, b;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [ r * 255, g * 255, b * 255 ];
}

// lower frequencies seem to contain more interesting stuff
var display_scale = (x) => {
  return Math.sqrt(x);
}

var screen_update = () => {
  var MAX_CAPTURED_FREQUENCY = audio_ctx.sampleRate/2;
  var midline = CANVAS_HEIGHT/2;

  audio_analyser.getByteFrequencyData(audio_data);

  // grid
  canvas_context.beginPath();
  canvas_context.strokeStyle = 'rgba(128,0,255,255)';
  for (var freq = MAX_DISPLAY_FREQUENCY; freq > 0; freq -= 100) {
    var x = Math.round(display_scale(freq / MAX_DISPLAY_FREQUENCY) * CANVAS_WIDTH);
    if (freq % 1000 == 0) {
      canvas_context.moveTo(x, midline - 8);
      canvas_context.lineTo(x, midline + 8);
    } else if (freq % 500 == 0) {
      canvas_context.moveTo(x, midline - 4);
      canvas_context.lineTo(x, midline + 4);
    } else if (freq % 100 == 0) {
      canvas_context.moveTo(x, midline - 2);
      canvas_context.lineTo(x, midline + 2);
    }
  }
  canvas_context.stroke();

  // frequency markers
  canvas_context.font='16px monospace';
  canvas_context.textAlign = 'center';
  canvas_context.textBaseline = 'top';
  canvas_context.fillStyle = 'white';
  for (var freq = MAX_DISPLAY_FREQUENCY; freq > 0; freq -= 1000) {
    var x = Math.round(display_scale(freq / MAX_DISPLAY_FREQUENCY) * CANVAS_WIDTH);
    canvas_context.fillText(freq/1000, x, 0);
  }
  canvas_context.textAlign = 'left';
  canvas_context.fillText('Frequency - kHz', 0, 0);

  // nearest neighbour maxval downscale/updscale of audiodata
  var canvas_accumulator = new Array(CANVAS_WIDTH).fill(0);
  var audio_data_span = audio_data.length*MAX_DISPLAY_FREQUENCY/MAX_CAPTURED_FREQUENCY
  var neighbour = (x) => {
    return Math.round(display_scale(x / audio_data_span) * CANVAS_WIDTH)
  }
  for (var i = 0; i < audio_data_span; i++) {
    var canvas_idx1 = neighbour(i);
    var canvas_idx2 = neighbour(i+1);
    canvas_accumulator.fill(
      Math.max(canvas_accumulator[canvas_idx1],audio_data[i]),canvas_idx1, canvas_idx2);
  }

  // colorify and display frequencies
  var r, g, b, value;
  for (var i = 0; i < CANVAS_WIDTH; i+=1) {
      value = canvas_accumulator[i] / 255.0;
      [r, g, b] = HSL2RGB(value*value/6, 1, Math.sqrt(value)*0.5)
      current_line_data.data[i*4+0] = r;
      current_line_data.data[i*4+1] = g;
      current_line_data.data[i*4+2] = b;
      current_line_data.data[i*4+3] = 255;
  }
  canvas_context.putImageData(current_line_data, 0, current_line);

  current_line++;
  if (current_line >= CANVAS_HEIGHT) {
    current_line = 16;
  }

  requestAnimationFrame(screen_update);
}

setTimeout(init, 0);
