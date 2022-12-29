// code compactify utilities

var ARRAYFILL = (s, e) => Array(s).fill(e)
var JSONSTRINGIFY = (x) => JSON.stringify(x)
var copy = (x) => JSON.parse(JSONSTRINGIFY(x))
var strequals = (x, y) => JSONSTRINGIFY(x) == JSONSTRINGIFY(y)
var len = (x) => x.length
var get_element_by_tag = (tag) => document.getElementsByTagName(tag)[0]
var get_element_by_id = (id) => document.getElementById(id)
var add_event_listener = (element, event, handler) => element.addEventListener(event, handler)

// board reset arrays

var EMPTY_BOARD_0 = ARRAYFILL(9,ARRAYFILL(9,0))
var EMPTY_BOARD_9 = ARRAYFILL(9,ARRAYFILL(9,[1,2,3,4,5,6,7,8,9]))
var EMPTY_BOARD_L = ARRAYFILL(9,ARRAYFILL(9,[]))

// board work arrays

var board_locked_values = copy(EMPTY_BOARD_0)
var board_selected_values = copy(EMPTY_BOARD_0)
var board_possible_values = copy(EMPTY_BOARD_9)

// board manipulation utilities

var board_get_values = (x, y) => {
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
}

var solve_reset = () => {
  board_possible_values = copy(EMPTY_BOARD_9)
}

// board solving

var solve_board = () => {
  return solve_quadrants() + solve_line(false) + solve_line(true)
}

var solve_set = (value_set, check_name) => {
  var values_size = len(value_set)
  var new_values = copy(value_set)
  // any "corellated" set of cells in sudoku
  // should have unique values assigned to each cell
  for (var i = 0; i < values_size; i++) {
    if (len(value_set[i]) == 1) { // have specific value assigned
      for(var j = 0; j < values_size; j++) { // eliminate that value for all other elements of the set
        if (j != i) { // for all other cells (causig cell itself should retain causing value)
          var idx = new_values[j].indexOf(value_set[i][0])
          if (idx > -1) {
            new_values[j].splice(idx, 1)
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
        if (count >= len(values) && JSONSTRINGIFY(new_values[j]) != JSONSTRINGIFY(values)) {
          // value_set[i] is definitely not in any other cells, even if count covers exactly these values
          new_values[j] = new_values[j].filter(e => values.indexOf(e) < 0)
        }
        if (count > len(values) && JSONSTRINGIFY(value_set[j]) == JSONSTRINGIFY(values)) {
          // value_set[i] instances could not possibly cover all values, contradiction
          new_values[j] = []
        }
      }
    }
  }
  return new_values
}

var solve_quadrants = () => {
  var changes = 0
  for (var qi = 0; qi < 3; qi++) {
    for (var qj = 0; qj < 3; qj++) {
      var quad_set = []
      for (var y = qj*3; y < qj*3+3; y++) {
        for (var x = qi*3; x < qi*3+3; x++) {
          quad_set.push(board_get_values(x,y))
        }
      }
      quad_set = solve_set(quad_set, `quad ${qi+1},${qj+1}`)
      for (var y = qj*3; y < qj*3+3; y++) {
        for (var x = qi*3; x < qi*3+3; x++) {
          var new_values = quad_set.shift()
          if (!strequals(board_possible_values[x][y],new_values)) {
            changes += 1
          }
          board_possible_values[x][y] = new_values
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
    for (var j = 0; j < 9; j++) {
      values.push(column ? board_get_values(i,j) : board_get_values(j,i))
    }
    values = solve_set(values, (column ? 'column ' : 'row ') + (i+1))
    for (var j = 0; j < 9; j++) {
      var new_values = values.shift()
      if (!strequals(column ? board_possible_values[i][j] : board_possible_values[j][i],new_values)) {
        changes += 1
      }
      if (column) {
        board_possible_values[i][j] = new_values
      } else {
        board_possible_values[j][i] = new_values
      }
    }
  }
  return changes
}

// user interface

var ctx = null
var canvas = null
var mouse_x = 0
var mouse_y = 0
var board_size = null

var color_background = 'white'

var color_board_background = '#FFFFE0'
var color_board_foreground = '#808080'
var color_board_grid = '#808080'
var color_value_impossible_foreground = '#E0E0E0'
var color_value_selected_foreground = '#4040F0'
var color_value_locked_foreground = '#404040'
var color_value_error_foreground = '#FF4040'

var mouse_in_rect = (rect) => {
  var mouse_in_rect_x = mouse_x - rect[0]
  var mouse_in_rect_y = mouse_y - rect[1]
  return mouse_in_rect_x > 0 && mouse_in_rect_x < rect[2] && mouse_in_rect_y > 0 && mouse_in_rect_y < rect[3]
}  

var subrect = (rect, dx, dy, ix, iy, margin) => {
  var w = rect[2] / dx
  var h = rect[3] / dy
  return [
    rect[0] + w * ix + margin,
    rect[1] + h * iy + margin,
    w - margin * 2,
    h - margin * 2
  ]
}

var ctx_rect = (rect, fill_color, edge_color) => {
  ctx.fillStyle = fill_color
  ctx.strokeStyle = edge_color
  ctx.fillRect.apply(ctx, rect)
  ctx.beginPath();
  ctx.rect.apply(ctx, rect)
  ctx.stroke();
}

var ctx_text = (rect, text, color) => {
  ctx.font = rect[3] + 'px Sans';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, rect[0] + rect[2] / 2, rect[1] + rect[3] / 2 * 1.1)
}

var ctx_line = (x1, y1, x2, y2) => {
  ctx.beginPath()
  ctx.strokeStyle = color_board_grid
  ctx.lineWidth = 2
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

var refresh_cells = (click) => {
  // erase entire board
  ctx_rect([0,0,board_size, board_size], color_background, color_background)

  // the main grid
  ctx_line(board_size/3,0,board_size/3,board_size)
  ctx_line(board_size/3*2,0,board_size/3*2,board_size)
  ctx_line(0,board_size/3,board_size,board_size/3)
  ctx_line(0,board_size/3*2,board_size,board_size/3*2)

  for (var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var crect = subrect([0, 0, board_size, board_size], 9, 9, x, y, 2)
      ctx_rect(crect, color_board_background, color_board_grid)

      var possible_values = board_possible_values[x][y]
      var selected_value = board_selected_values[x][y]

      // cell is a contradiction
      if (len(possible_values) == 0) {
        ctx_text(crect, 'X', color_value_error_foreground)
        continue
      }

      // cell is part of a predefined puzzle
      if (board_locked_values[x][y] != 0) {
        ctx_text(crect, board_locked_values[x][y], color_value_locked_foreground)
        continue
      }

      // cell is forced to a value by a human
      if (selected_value != 0) {
        ctx_text(crect, selected_value, color_value_selected_foreground)
        // allow to unselect the value
        if (click && mouse_in_rect(crect)) {
          board_selected_values[x][y] = 0
          resolve()
        }
        continue
      }

      // cell has only one solution
      if (len(possible_values) == 1) {
        ctx_text(crect, possible_values[0], color_board_foreground)
        continue
      }

      // the values
      for (var vy = 0; vy < 3; vy++) {
        for (var vx = 0; vx < 3; vx++) {
          var v = vy * 3 + vx + 1
          var value_is_possible = possible_values.includes(v)
          var vrect = subrect(crect, 3, 3, vx, vy, 1)
          ctx_rect(vrect,
            value_is_possible ? '#FFFF' + Math.floor(100 + 138/9*len(possible_values)).toString(16) : color_board_background,
            'transparent'
          )
          ctx_text(vrect, v, value_is_possible ? color_board_foreground : color_value_impossible_foreground)
          if (click && mouse_in_rect(vrect) && value_is_possible) {
            if (selected_value == v) {
              board_selected_values[x][y] = 0
            } else {  
              board_selected_values[x][y] = v
            }
            resolve()
          }
        }
      }

    }
  }
}

var resolve = () => {
  solve_reset()
  autosolve()
}

var autosolve = () => {
  var changes = solve_board()
  refresh_cells(false)
  if (changes > 0) {
    requestAnimationFrame(autosolve)
  }
}

var click = (e) => {
  var bounds = canvas.getBoundingClientRect()
  mouse_x = e.clientX - bounds.left
  mouse_y = e.clientY - bounds.top
  refresh_cells(true)
}

var prepare_button = (id, func) => {
  var the_button = get_element_by_id(id)
  the_button.style.fontSize = board_size / 27 + 'px'
  add_event_listener(the_button, 'click', (event) => {
    func()
    resolve()
  })
}

var init = () => {
  body = get_element_by_tag('body')
  body.style.margin = 0
  body.style.textAlign = 'center'
  canvas = get_element_by_tag('canvas')
  canvas.width = canvas.height = board_size = Math.min(body.clientWidth, body.clientHeight) * ( 26 / 28 )
  ctx = canvas.getContext('2d')

  add_event_listener(canvas, 'click', click)

  prepare_button('l', board_lock)
  prepare_button('c', board_clear)
}

init()
resolve()
