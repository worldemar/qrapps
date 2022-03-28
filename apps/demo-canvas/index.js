var mouse_x = 0, mouse_y = 0;
var circle_x = 0, circle_y = 0;
var body, canvas, ctx;

var init = () => {
  body = document.getElementsByTagName('body')[0]
  canvas = document.getElementsByTagName('canvas')[0]
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  body.addEventListener( 'mousemove', function(e) {
    bounds = body.getBoundingClientRect();
    mouse_x = e.clientX - bounds.left;
    mouse_y = e.clientY - bounds.top;
  });
}

var step = () => {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for(var i = 0; i < 10; i++) {
    var dx = (mouse_x - circle_x);
    var dy = mouse_y - circle_y;
    var dst = Math.sqrt(dx * dx + dy * dy);
    circle_x = circle_x + dx / (dst + 1);
    circle_y = circle_y + dy / (dst + 1);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(circle_x, circle_y, 8, 0, 2 * Math.PI);
    ctx.fill();
  }

  requestAnimationFrame(step);
}

init();
step();