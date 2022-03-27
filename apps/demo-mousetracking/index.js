var MX = 0, MY = 0, CX = 0, CY = 0, BDY, CNVS, CTX;

function init() {
  BDY = document.getElementsByTagName('body')[0]
  CNVS = document.getElementsByTagName('canvas')[0]
  CNVS.width = window.innerWidth;
  CNVS.height = window.innerHeight;
  CTX = CNVS.getContext('2d');
  BDY.addEventListener( 'mousemove', function(e) {
    bounds = BDY.getBoundingClientRect();
    MX = e.clientX - bounds.left;
    MY = e.clientY - bounds.top;
  });
}

function step() {
  CTX.fillStyle = 'rgba(0,0,0,0.1)';
  CTX.fillRect(0, 0, CNVS.width, CNVS.height);

  for(var i = 0; i < 10; i++) {
    let dx = MX - CX;
    let dy = MY - CY;
    let dst = Math.sqrt(dx * dx + dy * dy);
    CX = CX + dx / (dst + 1);
    CY = CY + dy / (dst + 1);

    CTX.fillStyle = 'white';
    CTX.beginPath();
    CTX.arc(CX, CY, 8, 0, 2 * Math.PI);
    CTX.fill();
  }

  requestAnimationFrame(step);
}

init();
step();