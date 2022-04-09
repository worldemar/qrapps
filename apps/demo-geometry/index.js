var line_x1 = 0, line_y1 = 0;
var line_dx1 = 17, line_dy1 = 19;
var line_x2 = 0, line_y2 = 0;
var line_dx2 = 17, line_dy2 = 19;
var frames = 0;
var CW, CH;
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
  CW = canvas.width = window.innerWidth;
  CH = canvas.height = window.innerHeight;
  line_x1 = CW / 3;
  line_y1 = 1;
  line_x2 = 1;
  line_y2 = CH / 4;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, CW, CH);
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
  [line_x1, line_dx1] = move_coord(line_x1, line_dx1, [0, CW]);
  [line_y1, line_dy1] = move_coord(line_y1, line_dy1, [0, CH]);
  [line_x2, line_dx2] = move_coord(line_x2, line_dx2, [0, CW]);
  [line_y2, line_dy2] = move_coord(line_y2, line_dy2, [0, CH]);
  frames++;
}

var line = (x1, y1, x2, y2) => {
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
}

var step = () => {
  ctx.fillStyle = '#00000020';
  ctx.fillRect(0, 0, CW, CH);

  var style = Math.floor(frames / 300) % 7;
  var phase = (1 - Math.pow(Math.cos(Math.PI * frames / 300), 100));
  ctx.lineWidth = phase * 6 + 0.5;
  ctx.strokeStyle = HSL2RGB(
    0.5 + Math.sin(Math.PI * frames / 600)/2,
    0.5 + Math.sin(Math.PI * frames / 100)/2,
    0.3 + 0.2 * phase
    );
  ctx.beginPath();
  switch (style) {
    case 0: // single line
      line(line_x1, line_y1, line_x2, line_y2);
      break;
    case 1: // four symmetric lines, the classic
      line(line_x1, line_y1, line_x2, line_y2);
      line(CW - line_x1, line_y1, CW - line_x2, line_y2);
      line(line_x1, CH - line_y1, line_x2, CH - line_y2);
      line(CW - line_x1, CH - line_y1, CW - line_x2, CH - line_y2);
      break;
    case 2: // single cross-line
      line(line_x1, line_y1, line_x2, line_y2);
      line(line_x1, line_y2, line_x2, line_y1);
      break;
    case 3: // four cross-lines
      line(line_x1     , line_y1     , line_x2     , line_y2);
      line(CW - line_x1, line_y1     , CW - line_x2, line_y2);
      line(line_x1     , CH - line_y1, line_x2     , CH - line_y2);
      line(CW - line_x1, CH - line_y1, CW - line_x2, CH - line_y2);
      line(line_x1     , line_y2     , line_x2     , line_y1);
      line(CW - line_x1, line_y2     , CW - line_x2, line_y1);
      line(line_x1     , CH - line_y2, line_x2     , CH - line_y1);
      line(CW - line_x1, CH - line_y2, CW - line_x2, CH - line_y1);
      break;
    case 4: // small square
      ctx.rect(line_x1, line_y1, line_x2 - line_x1, line_y2 - line_y1);
      break;
    case 5: // big square
      ctx.rect(line_x1, line_y1, CW - line_x1*2, CH - line_y1*2);
      ctx.rect(line_x2, line_y2, CW - line_x2*2, CH - line_y2*2);
      break;
    case 6: // big squares connected
      line(line_x1, line_y1, line_x2, line_y2);
      line(CW - line_x1, line_y1, CW - line_x2, line_y2);
      line(line_x1, CH - line_y1, line_x2, CH - line_y2);
      line(CW - line_x1, CH - line_y1, CW - line_x2, CH - line_y2);
      ctx.rect(line_x1, line_y1, CW - line_x1*2, CH - line_y1*2);
      ctx.rect(line_x2, line_y2, CW - line_x2*2, CH - line_y2*2);
      break;
    default:
      break;
  }
  ctx.stroke();
  animate();
  setTimeout(step, 100);
}

init();
step();