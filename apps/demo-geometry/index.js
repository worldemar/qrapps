var a_x = 0, a_y = 0;
var a_dx = 17, a_dy = 19;
var b_x = 0, b_y = 0;
var b_dx = 17, b_dy = 19;
var frames = 0;
var CW, CH;
var canvas, ctx;

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
}

var init = () => {
  canvas = document.getElementsByTagName('canvas')[0];
  CW = canvas.width = window.innerWidth;
  CH = canvas.height = window.innerHeight;
  a_x = CW / 3;
  a_y = 1;
  b_x = 1;
  b_y = CH / 4;
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
  [a_x, a_dx] = move_coord(a_x, a_dx, [0, CW]);
  [a_y, a_dy] = move_coord(a_y, a_dy, [0, CH]);
  [b_x, b_dx] = move_coord(b_x, b_dx, [0, CW]);
  [b_y, b_dy] = move_coord(b_y, b_dy, [0, CH]);
  frames++;
}

var mirror_h = (D) => { return [ CW - D[0], D[1] ] }
var mirror_v = (D) => { return [ D[0], CH - D[1] ] }
var line = (a, b) => { ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); };

var step = () => {
  // top left points
  var A0 = [a_x, a_y];
  var B0 = [b_x, b_y];
  // top right points
  var A1 = mirror_h(A0)
  var B1 = mirror_h(B0)
  // bottom right points
  var A2 = mirror_v(A1)
  var B2 = mirror_v(B1)
  // bottom left points
  var A3 = mirror_h(A2)
  var B3 = mirror_h(B2)

  // top left points
  var A0x = [a_x, b_y];
  var B0x = [b_x, a_y];
  // top right points
  var A1x = mirror_h(A0x);
  var B1x = mirror_h(B0x);
  // bottom right points
  var A2x = mirror_v(A1x);
  var B2x = mirror_v(B1x);
  // bottom left points
  var A3x = mirror_h(A2x);
  var B3x = mirror_h(B2x);

  var styles = [
    // single line
    () => { line(A0, B0); },
    // four symmetric lines, the classic
    () => { line(A0, B0); line(A1, B1); line(A2, B2); line(A3, B3) },
    // single cross-line
    () => { line(A0, B0); line(A0x, B0x) },
    // four cross-lines
    () => {
      line(A0, B0); line(A0x, B0x); line(A1, B1); line(A1x, B1x);
      line(A2, B2); line(A2x, B2x); line(A3, B3); line(A3x, B3x);
    },
    // small square
    () => { line(A0, B0x); line(B0x, B0); line(B0, A0x); line(A0x, A0); },
    // big square
    () => {
      line(A0, A1); line(A1, A2); line(A2, A3); line(A3, A0);
    },
    // big squares connected
    () => {
      line(A0, A1); line(A1, A2); line(A2, A3); line(A3, A0);
      line(A0x, A1x); line(A1x, A2x); line(A2x, A3x); line(A3x, A0x);      
      line(A0, B0); line(A1, B1); line(A2, B2); line(A3, B3);
    },
    // titled square
    () => { line(A0, B1); line(B1, A2); line(A2, B3); line(B3, A0); },
    // titled squares
    () => {
      line(A0, B1); line(B1, A2); line(A2, B3); line(B3, A0);
      line(B0, A1); line(A1, B2); line(B2, A3); line(A3, B0);
    },
  ];

  ctx.fillStyle = '#00000020';
  ctx.fillRect(0, 0, CW, CH);

  var style = Math.floor(frames / 300) % styles.length;
  var phase = (1 - Math.pow(Math.cos(Math.PI * frames / 300), 100));
  ctx.lineWidth = phase * 6 + 0.5;
  ctx.strokeStyle = HSL2RGB(
    0.5 + Math.sin(Math.PI * frames / 600)/2,
    0.5 + Math.sin(Math.PI * frames / 100)/2,
    0.3 + 0.2 * phase
    );
  ctx.beginPath();
  styles[style]();
  ctx.stroke();
  animate();
  setTimeout(step, 100);
}

init();
step();