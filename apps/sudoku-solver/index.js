// code compactify utilities

var ARRAYFILL = (s, e) => Array(s).fill(e)
var JSONSTRINGIFY = (x) => JSON.stringify(x)
var copy = (x) => JSON.parse(JSONSTRINGIFY(x))
var strequals = (x, y) => JSONSTRINGIFY(x) == JSONSTRINGIFY(y)
var len = (x) => x.length
var INNERHTML = (e, h) => e.innerHTML = h

// board reset arrays

var EMPTY_BOARD_0 = ARRAYFILL(9,ARRAYFILL(9,0))
var EMPTY_BOARD_9 = ARRAYFILL(9,ARRAYFILL(9,[1,2,3,4,5,6,7,8,9]))
var EMPTY_BOARD_L = ARRAYFILL(9,ARRAYFILL(9,[]))

// board work arrays

var board_locked_values = copy(EMPTY_BOARD_0)
var board_selected_values = copy(EMPTY_BOARD_0)
var board_possible_values = copy(EMPTY_BOARD_9)
var board_explanations = copy(EMPTY_BOARD_L)

// board manipulation utilities

var board_get_value = (x, y) => {
  if (board_locked_values[x][y] != 0) {
    return [board_locked_values[x][y]]
  }
  if (board_selected_values[x][y] != 0) {
    return [board_selected_values[x][y]]
  }
  return board_possible_values[x][y]
}

var board_lock = () => {
  board_locked_values = copy(board_selected_values)
}

var board_clear = () => {
  board_selected_values = copy(board_locked_values)
  board_possible_values = copy(EMPTY_BOARD_L)
  board_explanations = copy(EMPTY_BOARD_L)
}

var solve_reset = () => {
  board_possible_values = copy(EMPTY_BOARD_9)
  board_explanations = copy(EMPTY_BOARD_L)
}

// board solving

var solve_board = () => {
  return solve_quadrants() + solve_line(false) + solve_line(true)
}

var solve_set = (value_set, explanation_set, check_name) => {
  var values_size = len(value_set)
  var new_values = copy(value_set)
  var new_explanations = copy(explanation_set)
  // any "corellated" set of cells in sudoku
  // should have unique values assigned to each cell
  for (var i = 0; i < values_size; i++) {
    if (len(value_set[i]) == 1) { // have specific value assigned
      for(var j = 0; j < values_size; j++) { // eliminate that value for all other elements of the set
        if (j != i) { // for all other cells (causig cell itself should retain causing value)
          var idx = new_values[j].indexOf(value_set[i][0])
          if (idx > -1) {
            new_values[j].splice(idx, 1)
            var expl = `${value_set[i][0]} already set in ${check_name} - position ${i+1}`
            if (!new_explanations[j].includes(expl)) {
              new_explanations[j].push(expl)
            }
          }
        }
      }
    }
  }
  // any corellated set must not include more than N instances
  // of possible value selections of size N
  // otherwise there would be no way to spread possible values
  for (var i = 0; i < values_size; i++) {
    if (len(value_set[i]) > 1) {
      var count = 0
      var positions = []
      for (var j = 0; j < values_size; j++) {
        if (JSONSTRINGIFY(value_set[i]) == JSONSTRINGIFY(value_set[j])) {
          count += 1
          positions.push(j+1)
        }
      }
      var values = copy(value_set[i])
      for (var j = 0; j < values_size; j++) {
        var expl = ''
        if (count >= len(values) && JSONSTRINGIFY(new_values[j]) != JSONSTRINGIFY(values)) {
          // value_set[i] is definitely not in any other cells, even if count covers exactly these values
          new_values[j] = new_values[j].filter(e => values.indexOf(e) < 0)
          expl = `set ${values} already fully satisfied in ${check_name} - positions ${positions}`

        }
        if (count > len(values) && JSONSTRINGIFY(value_set[j]) == JSONSTRINGIFY(values)) {
          // value_set[i] instances could not possibly cover all values, contradiction
          new_values[j] = []
          expl = `set ${values} repeats too much: ${count} times`
        }
        if (expl && !new_explanations[j].includes(expl)) {
          new_explanations[j].push(expl)
        }
      }
    }
  }
  return {new_values, new_explanations}
}

var solve_quadrants = () => {
  var changes = 0
  for (var qi = 0; qi < 3; qi++) {
    for (var qj = 0; qj < 3; qj++) {
      var quad_set = []
      var expl_set = []
      for (var y = qj*3; y < qj*3+3; y++) {
        for (var x = qi*3; x < qi*3+3; x++) {
          quad_set.push(board_get_value(x,y))
          expl_set.push(board_explanations[x][y])
        }
      }
      var ret = solve_set(quad_set, expl_set, `quad ${qi+1},${qj+1}`)
      quad_set = ret.new_values
      expl_set = ret.new_explanations
      for (var y = qj*3; y < qj*3+3; y++) {
        for (var x = qi*3; x < qi*3+3; x++) {
          var new_values = quad_set.shift()
          if (!strequals(board_possible_values[x][y],new_values)) {
            changes += 1
          }
          board_possible_values[x][y] = new_values
          board_explanations[x][y] = expl_set.shift()
        }
      }
    }
  }
  return changes
}

var solve_line = (column) => {
  // column: boolean, true = solve columns, false = solve rows (flip coordinates)
  var changes = 0
  for (var i = 0; i < 9; i++) {
    var values = []
    var explanations = []
    for (var j = 0; j < 9; j++) {
      values.push(column ? board_get_value(i,j) : board_get_value(j,i))
      explanations.push(column ? board_explanations[i][j] : board_explanations[j][i])
    }
    var ret = solve_set(values, explanations, (column ? 'column ' : 'row ') + (i+1))
    values = ret.new_values
    explanations = ret.new_explanations
    for (var j = 0; j < 9; j++) {
      var new_values = values.shift()
      if (!strequals(column ? board_possible_values[i][j] : board_possible_values[j][i],new_values)) {
        changes += 1
      }
      if (column) {
        board_possible_values[i][j] = new_values
        board_explanations[i][j] = explanations.shift()
      } else {
        board_possible_values[j][i] = new_values
        board_explanations[j][i] = explanations.shift()
      }
    }
  }
  return changes
}

// user interface

var button_txt = (x, y, c, i, d, s, e) => {
  return `<button title="${e.join('\n')}" class="${c}" onclick=button_click(${x},${y},${i}) type=button ${d ? 'disabled' : ''}>${s}</button>`
}

var render_cells = () => {
  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      render_cell(x, y)
    }
  }
}

var render_cell = (x, y) => {
  var cell = document.getElementById(`c${x}${y}`)
  if (board_locked_values[x][y] != 0) {
    INNERHTML(cell, button_txt(x, y, 'large', 0, true, board_locked_values[x][y], []))
  } else if (board_selected_values[x][y] != 0) {
    INNERHTML(cell, button_txt(x, y, 'large', 0, false, board_selected_values[x][y], []))
  } else {
    values = board_possible_values[x][y]
    explanations = board_explanations[x][y]
    if (len(values) == 0) {
      INNERHTML(cell, button_txt(x, y, 'error', 0, true, 'X', explanations))
    } else {
      var new_html = ''
      for (var i = 1; i <= 9; i++) {
        var classname = 'board '+ (values.includes(i) ? ['single', 'double'][len(values) - 1] : [])
        new_html += button_txt(x, y, classname, i, !values.includes(i), i, explanations)
        new_html += i % 3 == 0 ? '<br/>' : ''
      }
      INNERHTML(cell, new_html)
    }
  }
}

var fill_document = () => {
  var table = ''
  table += '<table>'
  for (var indemy = 0; indemy < 3; indemy++) {
    table += '<tr>'
    for (var indemx = 0; indemx < 3; indemx++) {
      table += '<td>'
      table += '<table>'
      for (var indey = 0; indey < 3; indey++) {
        table += '<tr>'
        for (var index = 0; index < 3; index++) {
          table += `<td class=cell id=c${indemx * 3 + index}${indemy * 3 + indey}></td>`
        }
        table += '</tr>'
      }
      table += '</table>'
      table += '</td>'
    }
    table += '</tr>'
  }
  table += '</table>'
  table = '<a class=single>&emsp;</a> = one option left&nbsp;' +
    '<a class=double>&emsp;</a> = two options left<br/>' +
    '<a class=board onclick=btn_lock()>Freeze resolved values</a>&nbsp;' +
    '<a class=board onclick=btn_clear()>Clear solution</a>' +
    '<p>' + table + '</p>' // this is not a template string since it increases size
  INNERHTML(document.getElementsByTagName('body')[0], table)
}

var btn_lock = () => {
  board_lock()
  autosolve()
}

var btn_clear = () => {
  board_clear()
  solve_reset()
  autosolve()
}

var button_click = (x, y, value) => {
  board_selected_values[x][y] = value
  solve_reset()
  autosolve()
}

var autosolve = () => {
  var changes = solve_board()
  render_cells()
  if (changes > 0) {
    console.log(changes)
    setTimeout(autosolve, 10)
  }
}

fill_document()
autosolve()
