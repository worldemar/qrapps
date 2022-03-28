var queue_next_update = () => setTimeout(display_time, 1000);

var display_time = () => {
  document.getElementById('d').innerHTML = new Date().toLocaleString();
  queue_next_update();
};

queue_next_update();