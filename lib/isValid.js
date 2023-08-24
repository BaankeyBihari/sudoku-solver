function isValid(board, row, col, c) {
  for (let i = 0; i < 9; i++) {
    if (c !== 0) {
      if (board[i][col] === c && i !== row) return false; //check row
      if (board[row][i] === c && i !== col) return false; //check column
      var new_row = 3 * ((row / 3) | 0) + ((i / 3) | 0);
      var new_col = 3 * ((col / 3) | 0) + (i % 3);
      if (board[new_row][new_col] === c && (new_col !== col || new_row !== row)) return false; //check 3*3 block
    }
  }
  return true;
}

export default isValid;
