var line_x1 = 0, line_y1 = 0;
var line_dx1 = 17, line_dy1 = 19;
var line_x2 = 0, line_y2 = 0;
var line_dx2 = 17, line_dy2 = 19;
var frames = 0;
var canvas_width, canvas_height;
var body, canvas, ctx;

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
  return 'rgb('+ (r * 255) + ',' + (g * 255) + ',' +  (b * 255) + ',255)';
  return [ r * 255, g * 255, b * 255 ];
}

var init = () => {
  body = document.getElementsByTagName('body')[0];
  canvas = document.getElementsByTagName('canvas')[0];
  canvas_width = canvas.width = window.innerWidth;
  canvas_height = canvas.height = window.innerHeight;
  line_x1 = canvas_width / 3;
  line_y1 = 1;
  line_x2 = 1;
  line_y2 = canvas_height / 4;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas_width, canvas_height);
}

var move_coord = (x, dx, edges) => {
  var _x = x + dx;
  for (var i = 0; i < edges.length; i++) {
    if (edges[i] >= Math.min(x, _x) && edges[i] <= Math.max(x, _x)) {
      return [x, -dx];
    }
  }
  return [_x, dx];
}

var animate = () => {
  [line_x1, line_dx1] = move_coord(line_x1, line_dx1, [0, canvas_width]);
  [line_y1, line_dy1] = move_coord(line_y1, line_dy1, [0, canvas_height]);
  [line_x2, line_dx2] = move_coord(line_x2, line_dx2, [0, canvas_width]);
  [line_y2, line_dy2] = move_coord(line_y2, line_dy2, [0, canvas_height]);
  frames++;
}

var step = () => {
  ctx.fillStyle = '#00000020';
  ctx.fillRect(0, 0, canvas_width, canvas_height);

  var style = 1;
  switch (style) {
    case 0: // single line
      ctx.strokeStyle = HSL2RGB(0.5+Math.sin(frames/600)/2, 0.5+Math.sin(frames/600)/2, 0.5);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(line_x1, line_y1);
      ctx.lineTo(line_x2, line_y2);
      ctx.stroke();
      break;
    case 1: // four symmetric lines
      ctx.strokeStyle = HSL2RGB(0.5+Math.sin(frames/600)/2, 0.5+Math.sin(frames/600)/2, 0.5);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(line_x1, line_y1);
      ctx.lineTo(line_x2, line_y2);
      ctx.moveTo(canvas_width - line_x1, line_y1);
      ctx.lineTo(canvas_width - line_x2, line_y2);
      ctx.moveTo(line_x1, canvas_height - line_y1);
      ctx.lineTo(line_x2, canvas_height - line_y2);
      ctx.moveTo(canvas_width - line_x1, canvas_height - line_y1);
      ctx.lineTo(canvas_width - line_x2, canvas_height - line_y2);
      ctx.stroke();
      break;
    default:
      break;
  }
  animate();
  setTimeout(step, 100);
  //requestAnimationFrame(step);
}

init();
step();