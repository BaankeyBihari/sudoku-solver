export type SudokuGrid = (number | null)[][];

export type PossibleValuesGrid = (number[] | null)[][];

export type ConflictsGrid = boolean[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuSolver {
  solve: (grid: SudokuGrid) => boolean;
  isValid: (grid: SudokuGrid, row: number, col: number, num: number) => boolean;
  isGridValid: (grid: SudokuGrid) => boolean;
  isSolvable: (grid: SudokuGrid) => boolean;
  getPossibleValues: (grid: SudokuGrid, row: number, col: number) => number[];
  getAllPossibleValues: (grid: SudokuGrid) => PossibleValuesGrid;
  getConflictingCells: (grid: SudokuGrid) => ConflictsGrid;
}
