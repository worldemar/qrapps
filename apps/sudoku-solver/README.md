Simple sudoku solving helper. Use **lock** button to lock puzzle values and **clear** to erase user-selected solution values.

This solver highlights possible values for unfilled cells. All values put on the board are not questioned or checked. Solver assumes that user inputs are not self-contradictory and do not violate sudoku rules. 

This solver also _does not_ try to solve anything that is not directly put on the sudoku board. No cell values are assumed (except for cells that are limited to a single value by sudoku rules), no secondary boards solved with possible values, no heuristics, X-wing, Y-wing, Swordfish, XYZ-wing or any other advanced techniques applied.


**This helper only checks for basic sudoku rules an consequences to them**:
- unique values in: rows, columns, quadrants (contemporary sudoku rules)
  - A row/column/quadrant must not have more than **one** occurence of every single value.
    - if row/column/quadrant has a cell with certain value then that value is excluded from possible values for other cells in that row/column/quadrant.
- sufficient sets in: rows, columns, quadrants (a generalized version of rules above)
  - A row/column/quadrant must not have more than N cells that are limited to same value range of length N.
    - if row/column/quadrant has N (say, three) cells with same set of N (say, three) possible values (say, [X,Y,Z]), then no other cell in that row/column/quadrant could possible have either X, Y or Z, otherwise duplicates are inevitable. All other cells in row/column/quadrant would have these values excluded from their possible value sets. *Same applies to value sets of any length.*
    - if row/column/quadrant has _more_ than N (say, three) cells with same set of possible values of length N (say, [5,7,9]), then all of these cells could not possibly have values assigned to them, there is simply not enough possible values to fill each one, thus these cells are marked as contradictory (i.e. - error). *In this case current solution obviously already has an error, and there is no reason to go further*

Please note, that even this very simple solver witout any heuristics whatsoever is powerful enough to resolve most sudoku puzzles except really hard ones. Usage of this tool *may* decrease your enjoyment of solving sudoku by yourself. I enjoyed writing it, though 😄
