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
      const source = audio_ctx.createMediaStreamSource(stream);
      audio_analyser = audio_ctx.createAnalyser();

      // This seem to be some "magic" constant.
      // Lower or higher values perform worse
      // on tone generator tests for unknown reason.
      audio_analyser.fftSize = 16384;

      audio_data = new Uint8Array(audio_analyser.frequencyBinCount);
      source.connect(audio_analyser);
      screen_update();
    }
    var media_error_callback = function(err) {
      console.log('The following error occured: ' + err);
    }
    navigator.mediaDevices.getUserMedia({audio: true}).then(
      media_success_callback, media_error_callback);
  } else {
    console.log('getUserMedia not supported on your browser!');
  }
}

var rand = (max_value) => {
  return Math.floor(Math.random() * max_value);
}

const HSL = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return 'rgb('+ 255 * f(0) +',' + 255 * f(8) + ',' + 255 * f(4) +')';
};

const HSL3 = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
 function hslToRgb(h, s, l) {
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

var scale = (x) => {
  //return Math.log(x+1)/Math.log(2);
  return Math.sqrt(x);
}

var screen_update = () => {
  var MAX_CAPTURED_FREQUENCY = audio_ctx.sampleRate/2;
  var MAX_DISPLAY_FREQUENCY = 17000;

  // grid
  var midline = CANVAS_HEIGHT/2;
  canvas_context.beginPath();
  canvas_context.strokeStyle = 'rgba(128,0,255,255)';
  for (var freq = MAX_DISPLAY_FREQUENCY; freq > 0; freq -= 100) {
    var x = Math.round(scale(freq / MAX_DISPLAY_FREQUENCY) * CANVAS_WIDTH);
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
  canvas_context.font='14px monospace';
  canvas_context.textAlign = 'center';
  canvas_context.textBaseline = 'top';
  canvas_context.fillStyle='white';
  for (var freq = MAX_DISPLAY_FREQUENCY; freq > 0; freq -= 1000) {
    var x = Math.round(scale(freq / MAX_DISPLAY_FREQUENCY) * CANVAS_WIDTH);
    canvas_context.fillText(freq/1000, x, 0);
  }


  // Each item in the array represents the decibel value for a specific frequency.
  // The frequencies are spread linearly from 0 to 1/2 of the sample rate.
  // For example, for 48000 sample rate, the last item of the array will represent
  // the decibel value for 24000 Hz.
  // see audioCtx.sampleRate
  
  // interpolation plan
  // audio_data: 0 <-> audio_analyser.frequencyBinCount
  // Frequency : 0 <-> audio_ctx.sampleRate/2
  // canvas    : 0 <-> CANVAS_WIDTH
  audio_analyser.getByteFrequencyData(audio_data);
 
  // var gradient = canvas_context.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
  // for (var i = 0; i < audio_data.length*MAX_DISPLAY_FREQUENCY/MAX_CAPTURED_FREQUENCY; i++) {
  //   var x = scale(i / (audio_data.length*MAX_DISPLAY_FREQUENCY/MAX_CAPTURED_FREQUENCY));
  //   var v = audio_data[i];
  //   // I could not find any documentation on maximum number
  //   // of allowed ColorStop-s. There is also no information on
  //   // precision of first argument and whether it is possible to
  //   // overwrite values that were set previously.
  //   // This loop could be overwriting some stops. Needs more testing.
  //   gradient.addColorStop(x, HSL(v/6, 0.5+v/2, 0.2+v/3));
  // }
  // canvas_context.fillStyle = gradient;
  // canvas_context.fillRect(0, current_line, CANVAS_WIDTH, 1);

  var canvas_accumulator = new Array(CANVAS_WIDTH).fill(0);
  // nearest neighbour downscale
  var audio_data_span = audio_data.length*MAX_DISPLAY_FREQUENCY/MAX_CAPTURED_FREQUENCY
  for (var i = 0; i < audio_data_span; i++) {
    var canvas_idx = Math.round(scale(i / audio_data_span) * CANVAS_WIDTH);
    var canvas_idx1 = Math.round(scale((i+1) / audio_data_span) * CANVAS_WIDTH);
    var new_value = canvas_accumulator[canvas_idx] < audio_data[i] ? audio_data[i] : canvas_accumulator[canvas_idx];
    for (var fill=canvas_idx; fill<canvas_idx1; fill++) {
      canvas_accumulator[fill] = new_value;
    }
    //canvas_accumulator[canvas_idx] += audio_data[i];
  }
  // for (var i = 0; i < canvas_accumulator.length; i++) {
  //   canvas_accumulator[i] = Math.round(canvas_accumulator[i] * canvas_accumulator.length / audio_data_span);
  // }
  for (var i = 0; i < CANVAS_WIDTH; i+=1) {
      var value = canvas_accumulator[i] / 255.0;
      var r, g, b;
      //value = (Math.cos(i*6.28/CANVAS_WIDTH)+1)/2;
      //[r, g, b] = HSL3(value/10., 255, 128-255/5+value/5)
      [r, g, b] = hslToRgb(value*value/6, 1, Math.sqrt(value)*0.5)
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
