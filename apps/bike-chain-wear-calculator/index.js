var h_canvas, ctx;
var chain_wear = Array(100);
var canvas_scale_x = 8;
var canvas_scale_y = 4;
var my_gradient;
var index;

var get_input_value = (id_string) => {
  return parseFloat(document.getElementById(id_string).value)
}

var reset = () => {
  chain_wear = Array(get_input_value('chain'))
  chain_wear.fill(0)
  h_canvas.width = get_input_value('chain') * canvas_scale_x;
  h_canvas.height = 100 * canvas_scale_y;
  my_gradient = ctx.createLinearGradient(0, 0, 0, h_canvas.height);
  my_gradient.addColorStop(0, 'red');
  my_gradient.addColorStop(0.5, 'lime');
  my_gradient.addColorStop(1, 'blue');
  calc()
}


var calc = () => {
  for (calc_current_tooth = 0; calc_current_tooth < get_input_value('chain') * 1000; calc_current_tooth++) {
    var chainring_teeth = get_input_value('chainring')
    var force = Math.abs(Math.sin(Math.PI * 2 * (calc_current_tooth % chainring_teeth) / chainring_teeth))
    chain_wear[calc_current_tooth % get_input_value('chain')] += force
  }
}

var step = () => {
  var max_wear = chain_wear.reduce((a, b) => Math.max(a, b), -Infinity);
  var min_wear = chain_wear.reduce((a, b) => Math.min(a, b), +Infinity);
  var avg_wear = chain_wear.reduce((a, b) => a + b) / chain_wear.length;
  document.getElementById('min').innerHTML = Math.round(min_wear / max_wear * 100) + '%'
  document.getElementById('avg').innerHTML = Math.round(avg_wear / max_wear * 100) + '%'

  for (index = 0; index < chain_wear.length; index++) {
    var link_wear = chain_wear[index];
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(index * canvas_scale_x, 0, canvas_scale_x, h_canvas.height * canvas_scale_y);
    ctx.fillStyle = my_gradient;
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(index * canvas_scale_x, h_canvas.height, canvas_scale_x - 1, -h_canvas.height * link_wear / max_wear);
  }
  requestAnimationFrame(step);
}

var load = () => {
  document.getElementById('chain').onchange = reset
  document.getElementById('chainring').onchange = reset
  h_canvas = document.getElementsByTagName('canvas')[0]
  ctx = h_canvas.getContext('2d');
  reset();
  step();
}

setTimeout(load, 1);
