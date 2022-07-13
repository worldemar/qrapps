var cell_values = []

var button_click = (x, y, value) => {
  cell_values[x][y] = value
  render_cells()
}

var possible_values = (x, y) => {
  new_values = [1,2,3,4,5,6,7,8,9]
  // rows must have unique values
  for (var xi = 0; xi < 9; xi++) {
    if (xi == x) {
      continue
    }
    var index = new_values.indexOf(cell_values[xi][y]);
    if (index > -1) {
      new_values.splice(index, 1);
    }
  }
  // columns must have unique values
  for (var yi = 0; yi < 9; yi++) {
    if (yi == y) {
      continue
    }
    var index = new_values.indexOf(cell_values[x][yi]);
    if (index > -1) {
      new_values.splice(index, 1);
    }
  }
  // quadrants must have unique values
  var qx = x - x % 3
  var qy = y - y % 3
  for (var xi = qx; xi < qx+3; xi++) {
    for (var yi = qy; yi < qy+3; yi++) {
      if (xi == x && yi == y) {
        continue
      }
      var index = new_values.indexOf(cell_values[xi][yi]);
      if (index > -1) {
        new_values.splice(index, 1);
      }
    }
  }
  return new_values
}

var button_txt = (x, y, c, i, d, s) => {
  return '<button class=' + c + ' onclick="button_click(' + x + ',' + y + ',' + i + ')" type=button ' + (d ? 'disabled' : '') + '>' + s + '</button>'
}

var render_cells = () => {
  for (var x = 0; x < 9; x++) {
    for (var y = 0; y < 9; y++) {
      render_cell(x, y)
    }
  }
}

var render_cell = (x, y) => {
  var cell = document.getElementById('c' + x + y)
  var the_value = cell_values[x][y]
  if (the_value != 0) {
    cell.innerHTML = button_txt(x, y, 'large', 0, false, the_value)
  } else {
    var pv = possible_values(x, y)
    cell.innerHTML = ''
    for (var i = 1; i <= 9; i++) {
      var disabled = pv.includes(i) ? '' : 'disabled'
      cell.innerHTML += button_txt(x, y, pv.length == 1 && pv.includes(i) ? 'single' : 'small', i, !pv.includes(i), i)
      cell.innerHTML += i % 3 == 0 ? '<br/>' : ''
    }
  }
}

var fill_document = () => {
  var table = ''
  table += '<table cellpadding=0>'
  for (var indemy = 0; indemy < 3; indemy++) {
    table += '<tr>'
    for (var indemx = 0; indemx < 3; indemx++) {
      table += '<td>'
      table += '<table cellpadding=4>'
      for (var indey = 0; indey < 3; indey++) {
        table += '<tr>'
        for (var index = 0; index < 3; index++) {
          var indexx = indemx * 3 + index
          var indeyy = indemy * 3 + indey
          table += '<td class=cell id="c' + indexx + indeyy + '"></td>'
        }
        table += '</tr>'
      }
      table += '</table>'
      table += '</td>'
    }
    table += '</tr>'
  }
  table += '</table>'
  document.getElementsByTagName('body')[0].innerHTML=table
}

fill_array = () => {
  for (var x = 0; x < 9; x++) {
    cell_values.push([])
    for (var y = 0; y < 9; y++) {
      cell_values[x].push(0)
    }
  }
}



var init = () => {
  fill_document()
  fill_array()
  render_cells()
}

init();
