function dt() {
  const n = new Date();
  let h = lz(n.getHours());
  let m = lz(n.getMinutes());
  let s = lz(n.getSeconds());
  document.getElementById('d').innerHTML =  h + " : " + m + " : " + s;
  setTimeout(dt, 1000);
};

function lz(i) {
  if (i < 10) { i = "0" + i; }; 
  return i;
};

setTimeout(dt, 1000);