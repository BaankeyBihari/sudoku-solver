export const init9x9Grid = (value) => {
  let arr = new Array(9);
  for (let i = 0; i < 9; i++) {
    arr[i] = new Array(9).fill(value);
  }
  return arr;
}

export const copy9x9Grid = (source, destination) => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      destination[i][j] = source[i][j];
    }
  }
}

export const initSudoku = (source) => {
  let arr = init9x9Grid(0);
  if (source) {
    copy9x9Grid(source, arr);
  }
  return arr;
};

export default init9x9Grid;
