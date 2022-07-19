var ROW_0 = [0,0,0,0,0,0,0,0,0]
var EMPTY_BOARD_0 = [ROW_0,ROW_0,ROW_0,ROW_0,ROW_0,ROW_0,ROW_0,ROW_0,ROW_0]
var ROW_L = [[],[],[],[],[],[],[],[],[]]
var EMPTY_BOARD_L = [ROW_L,ROW_L,ROW_L,ROW_L,ROW_L,ROW_L,ROW_L,ROW_L,ROW_L]
var copy = (x) => {
  return JSON.parse(JSON.stringify(x))
}

var board_locked_values = copy(EMPTY_BOARD_0)
var board_selected_values = copy(EMPTY_BOARD_0)
var board_possible_values = copy(EMPTY_BOARD_L)
var board_explanations = copy(EMPTY_BOARD_L)

var board_get_value = (x, y) => {
  if (board_locked_values[x][y] != 0) {
    return board_locked_values[x][y]
  }
  if (board_selected_values[x][y] != 0) {
    return board_selected_values[x][y]
  }
  if (board_possible_values[x][y].length != 0) {
    return board_possible_values[x][y]
  }
  return null
}

var board_lock = () => {
  board_locked_values = copy(board_selected_values)
}

var board_clear = () => {
  board_selected_values = copy(board_locked_values)
  board_possible_values = copy(EMPTY_BOARD_L)
  board_explanations = copy(EMPTY_BOARD_L)
}

var possible_values_basic = (x, y) => {
  new_values = [1,2,3,4,5,6,7,8,9]
  explanations = []
  // quadrants must have unique values
  var qx = x - x % 3
  var qy = y - y % 3
  for (var j = qy; j < qy+3; j++) {
    for (var i = qx; i < qx+3; i++) {
      if (i == x && j == y) {
        continue
      }
      var board_value = board_get_value(i,j)
      var index = new_values.indexOf(board_value)
      if (index > -1) {
        new_values.splice(index, 1)
        explanations.push(board_value + ' already in quadrant')
      }
    }
  }
  // rows must have unique values
  for (var i = 0; i < 9; i++) {
    if (i == x) {
      continue
    }
    var board_value = board_get_value(i,y)
    var index = new_values.indexOf(board_value)
    if (index > -1) {
      new_values.splice(index, 1);
      explanations.push(board_value + ' already in row (' + i + ')')
    }
  }
  // columns must have unique values
  for (var i = 0; i < 9; i++) {
    if (i == y) {
      continue
    }
    var board_value = board_get_value(x,i)
    var index = new_values.indexOf(board_value)
    if (index > -1) {
      new_values.splice(index, 1)
      explanations.push(board_value + ' already in column (' + i + ')')
    }
  }
  return {new_values, explanations}
}

var possible_values_set = (x, y) => {
  var {new_values, explanations} = possible_values_basic(x, y)
  // quadrants must not have more sets of new_values that it's length
  // otherwise there is no way to spread all values to them
  var same_sets = 1
  var qx = x - x % 3
  var qy = y - y % 3
  for (var j = qy; j < qy+3; j++) {
    for (var i = qx; i < qx+3; i++) {
      if (i == x && j == y) {
        continue
      }
      var nv = possible_values_basic(i, j)
      if (Array.isArray(nv.new_values)) {
        if (JSON.stringify(nv.new_values) == JSON.stringify(new_values)) {
          same_sets += 1
        }
      }
    }
  }
  if (same_sets > new_values.length) {
    explanations.push(JSON.stringify(new_values) + ' in quadrant ' + same_sets + ' times')
    new_values = []
  }

  explanations.sort()
  return {new_values, explanations}
}

var button_txt = (x, y, c, i, d, s, e) => {
  return '<button title="' + e.join('\n') + '" class="' + c + '" onclick="button_click(' + x + ',' + y + ',' + i + ')" type=button ' + (d ? 'disabled' : '') + '>' + s + '</button>'
}

var render_cells = () => {
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      render_cell(x, y)
    }
  }
}

var render_cell = (x, y) => {
  var cell = document.getElementById('c' + x + y)
  if (board_locked_values[x][y] != 0) {
    cell.innerHTML = button_txt(x, y, 'large', 0, true, board_locked_values[x][y], [])
  } else if (board_selected_values[x][y] != 0) {
    cell.innerHTML = button_txt(x, y, 'large', 0, false, board_selected_values[x][y], [])
  } else {
    values = board_possible_values[x][y]
    explanations = board_explanations[x][y]
    if (values.length == 0) {
      cell.innerHTML = button_txt(x, y, 'error', 0, true, 'X', explanations)
    } else {
      var new_html = ''
      for (var i = 1; i <= 9; i++) {
        var classname = 'board '+ (values.includes(i) ? ['single', 'double'][values.length - 1] : [])
        new_html += button_txt(x, y, classname, i, !values.includes(i), i, explanations)
        new_html += i % 3 == 0 ? '<br/>' : ''
      }
      cell.innerHTML = new_html
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
  document.getElementsByTagName('body')[0].innerHTML = '<button class=single>X</button> - one option left&nbsp;'
  document.getElementsByTagName('body')[0].innerHTML += '<button class=double>Y</button> - two options left&nbsp;'
  document.getElementsByTagName('body')[0].innerHTML += '<button onclick="btn_lock()">Freeze resolved values</button>&nbsp;'
  document.getElementsByTagName('body')[0].innerHTML += '<button onclick="btn_clear()">Clear solution</button>&nbsp;'
  document.getElementsByTagName('body')[0].innerHTML += '<p>' + table + '</p>'
}

var btn_lock = () => {
  board_lock()
  solve_board()
  render_cells()
}

var btn_clear = () => {
  board_clear()
  solve_board()
  render_cells()
}

var button_click = (x, y, value) => {
  board_selected_values[x][y] = value
  solve_board()
  render_cells()
}

var solve_board = () => {
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var {new_values, explanations} = possible_values_basic(x, y)
      board_possible_values[x][y] = new_values
      board_explanations[x][y] = explanations
    }
  }
}

var repeat = () => {
  solve_board()
  render_cells()
  setTimeout(render, 1000)
}

fill_document()
repeat()
