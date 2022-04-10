var a_x = 0, a_y = 0;
var a_dx = 17, a_dy = 19;
var b_x = 0, b_y = 0;
var b_dx = 17, b_dy = 19;
var frames = 1;
var CW, CH;
var canvas, ctx;
var style = 0;
var last_styles = [0];

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

  // drawing helpers
  var s_line_0 = () => { line(A0, B0); }
  var s_line_1 = () => { line(A1, B1); }
  var s_line_2 = () => { line(A2, B2); }
  var s_line_3 = () => { line(A3, B3); }
  var s_line_0x = () => { line(A0x, B0x); }
  var s_line_1x = () => { line(A1x, B1x); }
  var s_line_2x = () => { line(A2x, B2x); }
  var s_line_3x = () => { line(A3x, B3x); }
  var s_rect_0 = () => { line(A0, B0x); line(B0x, B0); line(B0, A0x); line(A0x, A0); }
  var s_rect_1 = () => { line(A1, B1x); line(B1x, B1); line(B1, A1x); line(A1x, A1); }
  var s_rect_2 = () => { line(A2, B2x); line(B2x, B2); line(B2, A2x); line(A2x, A2); }
  var s_rect_3 = () => { line(A3, B3x); line(B3x, B3); line(B3, A3x); line(A3x, A3); }
  var s_rect_A = ()  => { line(A0, A1); line(A1, A2); line(A2, A3); line(A3, A0); }
  var s_rect_B = ()  => { line(B0, B1); line(B1, B2); line(B2, B3); line(B3, B0); }
  var s_tilt_A = ()  => { line(A0, B1); line(B1, A2); line(A2, B3); line(B3, A0); }
  var s_tilt_B = ()  => { line(B0, A1); line(A1, B2); line(B2, A3); line(A3, B0); }
  
  var styles = [
    // 0 : just 1 line
    [ s_line_0 ],
    // 1 : 1 line with center symmetry
    [ s_line_0, s_line_2 ],
    // 2 : 4 lines with center symmetry
    [ s_line_0, s_line_1, s_line_2, s_line_3 ],
    // 3 : 1 line as X
    [ s_line_0, s_line_0x ],
    // 4 : two symmetric lines as X
    [ s_line_0, s_line_0x, s_line_2, s_line_2x ],
    // 5 : 1 line and its center-symmetrical X-line
    [ s_line_0, s_line_2x ],
    // 6 : 4 symmetric lines as X
    [ s_line_0, s_line_0x, s_line_1, s_line_1x, s_line_2, s_line_2x, s_line_3, s_line_3x ],
    // 7 : 1 small rect
    [ s_rect_0 ],
    // 8 : 2 symmetric small rects
    [ s_rect_0, s_rect_2 ],
    // 9 : 4 symmetric small rects
    [ s_rect_0, s_rect_1, s_rect_2, s_rect_3 ],
    //10 : 1 big rect on A points
    [ s_rect_A ],
    //11 : 1 big rect on B points
    [ s_rect_B ],
    //12 : 2 big rects on A and B points
    [ s_rect_A, s_rect_B ],
    //13 : 2 big rects on A and B points connected with all 4 lines
    [ s_rect_A, s_rect_B, s_line_0, s_line_1, s_line_2, s_line_3 ],
    //14 : 1 big slanted rect starting on A
    [ s_tilt_A ],
    //15 : 1 big slanted rect starting on B
    [ s_tilt_B ],
    //16 : 2 big slanted rects starting on A and B
    [ s_tilt_A, s_tilt_B ],
    //17 : 2 big slanted rects starting on A and B connected with all 4 lines
    [ s_tilt_A, s_tilt_B, s_line_0, s_line_1, s_line_2, s_line_3 ],
  ]

  var transitions = {
    0 : [   1,    3,    5,    7,                              ],
    1 : [0,    2, 3, 4, 5,                                    ],
    2 : [   1,       4,    6,       9,10,11,   13,14,15,   17,],
    3 : [0, 1,       4, 5,    7,                              ],
    4 : [   1, 2, 3,    5, 6,    8, 9,                        ],
    5 : [0, 1,    3, 4,          8,                           ],
    6 : [      2,    4,          8, 9,10,11,   13,14,15,   17,],
    7 : [0,       3,             8,                           ],
    8 : [            4, 5, 6, 7,    9,                        ],
    9 : [      2,    4,    6,    8,   10,11,12,13,14,15,   17,],
    10: [      2,          6,       9,   11,12,   14,15,      ],
    11: [      2,          6,       9,10,   12,   14,15,      ],
    12: [                           9,10,11,   13,         17,],
    13: [      2,          6,       9,      12,            17,],
    14: [      2,          6,       9,10,11,         15,      ],
    15: [      2,          6,       9,10,11,      14,   16,   ],
    16: [                                            15,   17,],
    17: [      2,          6,       9,      12,13,      16,   ]
  }

  ctx.fillStyle = '#00000020';
  ctx.fillRect(0, 0, CW, CH);
  var phase = (1 - Math.pow(Math.cos(Math.PI * frames / 300), 100));
  ctx.lineWidth = phase * 6 + 0.5;
  ctx.strokeStyle = HSL2RGB(
    0.5 + Math.sin(Math.PI * frames / 600)/2,
    0.5 + Math.sin(Math.PI * frames / 100)/2,
    0.3 + 0.2 * phase
    );
  ctx.beginPath();
  styles[style].forEach(f => { f(); });
  ctx.stroke();

  if (phase < 0.001) {
    var pick_new_style = () => {
      return transitions[style][Math.floor(Math.random() * transitions[style].length)];
    }
    var new_style = pick_new_style();
    var attempts = 0;
    while (last_styles.includes(new_style) && attempts < 1000) {
      attempts++;
      new_style = pick_new_style();
    }
    if (attempts > 999) {
      console.log('forced to go with style=' + new_style);
    }
    style = new_style;
    last_styles.push(style);
    while (last_styles.length > 15) {
      last_styles.shift();
    }
    console.log(last_styles);
  }

  animate();
  setTimeout(step, 50);
}

init();
step();