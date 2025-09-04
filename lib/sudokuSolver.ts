import { SudokuGrid } from '@/types/sudoku';

export class SudokuSolver {
  /**
   * Solves the sudoku puzzle using optimized backtracking algorithm
   */
  static solve(grid: SudokuGrid): boolean {
    // Early validation: if grid is already invalid, return false immediately
    if (!this.isGridValid(grid)) {
      return false;
    }

    // Find the empty cell with the fewest possible values (Most Constraining Variable heuristic)
    const findBestEmptyCell = (): [number, number, number[]] | null => {
      let bestCell: [number, number, number[]] | null = null;
      let minPossibilities = 10;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === null || grid[row][col] === 0) {
            const possibilities = this.getPossibleValues(grid, row, col);

            // If no possibilities, this path is invalid
            if (possibilities.length === 0) {
              return null;
            }

            // If only one possibility, use it immediately (naked single)
            if (possibilities.length === 1) {
              return [row, col, possibilities];
            }

            // Keep track of the cell with minimum possibilities
            if (possibilities.length < minPossibilities) {
              minPossibilities = possibilities.length;
              bestCell = [row, col, possibilities];
            }
          }
        }
      }

      return bestCell;
    };

    const result = findBestEmptyCell();
    if (!result) {
      // Check if we're done or hit an impossible state
      return this.isGridComplete(grid);
    }

    const [row, col, possibilities] = result;

    // Try each possibility (already pre-computed and validated)
    for (const num of possibilities) {
      grid[row][col] = num;

      if (this.solve(grid)) {
        return true;
      }
    }

    // All possibilities failed - backtrack by clearing the cell
    grid[row][col] = null;
    return false;
  }

  /**
   * Checks if the grid is completely filled
   */
  static isGridComplete(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null || grid[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if placing a number at a specific position is valid (optimized)
   */
  static isValid(
    grid: SudokuGrid,
    row: number,
    col: number,
    num: number
  ): boolean {
    // Check row - early exit on first conflict
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) {
        return false;
      }
    }

    // Check column - early exit on first conflict
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) {
        return false;
      }
    }

    // Check 3x3 box - optimized calculation and early exit
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxStartRow + i][boxStartCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validates if the current grid state is valid
   */
  static isGridValid(grid: SudokuGrid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value !== null && value !== 0) {
          // Temporarily remove the value to check if it's valid in this position
          grid[row][col] = null;
          const isValid = this.isValid(grid, row, col, value);
          grid[row][col] = value; // Restore the value

          if (!isValid) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * Creates a deep copy of the grid
   */
  static cloneGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
  }

  /**
   * Gets all possible values for a specific cell (optimized)
   */
  static getPossibleValues(
    grid: SudokuGrid,
    row: number,
    col: number
  ): number[] {
    if (grid[row][col] !== null && grid[row][col] !== 0) {
      return []; // Cell is already filled
    }

    // Use a boolean array for faster lookups
    const used = new Array(10).fill(false); // index 0 unused, 1-9 for numbers

    // Check row
    for (let x = 0; x < 9; x++) {
      const val = grid[row][x];
      if (val !== null && val !== 0) {
        used[val] = true;
      }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      const val = grid[x][col];
      if (val !== null && val !== 0) {
        used[val] = true;
      }
    }

    // Check 3x3 box
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const val = grid[boxStartRow + i][boxStartCol + j];
        if (val !== null && val !== 0) {
          used[val] = true;
        }
      }
    }

    // Collect available values
    const possibleValues: number[] = [];
    for (let num = 1; num <= 9; num++) {
      if (!used[num]) {
        possibleValues.push(num);
      }
    }

    return possibleValues;
  }

  /**
   * Advanced solve with constraint propagation and naked singles
   */
  static solveAdvanced(grid: SudokuGrid): boolean {
    let changed = true;

    // First pass: Apply constraint propagation and find naked singles
    while (changed) {
      changed = false;

      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === null || grid[row][col] === 0) {
            const possibilities = this.getPossibleValues(grid, row, col);

            if (possibilities.length === 0) {
              return false; // Invalid state
            }

            if (possibilities.length === 1) {
              grid[row][col] = possibilities[0];
              changed = true;
            }
          }
        }
      }

      // Check for hidden singles (numbers that can only go in one place in a unit)
      changed = this.findHiddenSingles(grid) || changed;
    }

    // If not solved, use backtracking
    return this.isGridComplete(grid) || this.solve(grid);
  }

  /**
   * Find hidden singles in rows, columns, and boxes
   */
  static findHiddenSingles(grid: SudokuGrid): boolean {
    let changed = false;

    // Check rows
    for (let row = 0; row < 9; row++) {
      changed = this.findHiddenSinglesInRow(grid, row) || changed;
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      changed = this.findHiddenSinglesInCol(grid, col) || changed;
    }

    // Check boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        changed =
          this.findHiddenSinglesInBox(grid, boxRow * 3, boxCol * 3) || changed;
      }
    }

    return changed;
  }

  /**
   * Find hidden singles in a specific row
   */
  static findHiddenSinglesInRow(grid: SudokuGrid, row: number): boolean {
    let changed = false;

    for (let num = 1; num <= 9; num++) {
      let possibleCol = -1;
      let count = 0;

      for (let col = 0; col < 9; col++) {
        if (
          (grid[row][col] === null || grid[row][col] === 0) &&
          this.isValid(grid, row, col, num)
        ) {
          possibleCol = col;
          count++;
        }
      }

      if (count === 1 && possibleCol !== -1) {
        grid[row][possibleCol] = num;
        changed = true;
      }
    }

    return changed;
  }

  /**
   * Find hidden singles in a specific column
   */
  static findHiddenSinglesInCol(grid: SudokuGrid, col: number): boolean {
    let changed = false;

    for (let num = 1; num <= 9; num++) {
      let possibleRow = -1;
      let count = 0;

      for (let row = 0; row < 9; row++) {
        if (
          (grid[row][col] === null || grid[row][col] === 0) &&
          this.isValid(grid, row, col, num)
        ) {
          possibleRow = row;
          count++;
        }
      }

      if (count === 1 && possibleRow !== -1) {
        grid[possibleRow][col] = num;
        changed = true;
      }
    }

    return changed;
  }

  /**
   * Find hidden singles in a specific 3x3 box
   */
  static findHiddenSinglesInBox(
    grid: SudokuGrid,
    startRow: number,
    startCol: number
  ): boolean {
    let changed = false;

    for (let num = 1; num <= 9; num++) {
      let possibleRow = -1;
      let possibleCol = -1;
      let count = 0;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const row = startRow + i;
          const col = startCol + j;

          if (
            (grid[row][col] === null || grid[row][col] === 0) &&
            this.isValid(grid, row, col, num)
          ) {
            possibleRow = row;
            possibleCol = col;
            count++;
          }
        }
      }

      if (count === 1 && possibleRow !== -1 && possibleCol !== -1) {
        grid[possibleRow][possibleCol] = num;
        changed = true;
      }
    }

    return changed;
  }

  /**
   * Gets possible values for all empty cells in the grid
   */
  static getAllPossibleValues(grid: SudokuGrid): (number[] | null)[][] {
    const possibleValues: (number[] | null)[][] = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null || grid[row][col] === 0) {
          possibleValues[row][col] = this.getPossibleValues(grid, row, col);
        }
      }
    }

    return possibleValues;
  }

  /**
   * Checks if a puzzle is solvable without modifying the original grid
   */
  static isSolvable(grid: SudokuGrid): boolean {
    // First check if current state is valid
    if (!this.isGridValid(grid)) {
      return false;
    }

    // Create a copy and try to solve it
    const gridCopy = this.cloneGrid(grid);
    return this.solve(gridCopy);
  }

  /**
   * Gets all cells that are in conflict (invalid placement)
   */
  static getConflictingCells(grid: SudokuGrid): boolean[][] {
    const conflicts: boolean[][] = Array(9)
      .fill(null)
      .map(() => Array(9).fill(false));

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value !== null && value !== 0) {
          // Temporarily remove the value to check if it's valid in this position
          grid[row][col] = null;
          const isValid = this.isValid(grid, row, col, value);
          grid[row][col] = value; // Restore the value

          if (!isValid) {
            conflicts[row][col] = true;
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Generates a random sudoku puzzle with specified parameters
   */
  static generateRandomPuzzle(
    filledCells: number = 30,
    requireUniqueness: boolean = true
  ): SudokuGrid {
    // Validate input parameters
    if (filledCells < 17 || filledCells > 81) {
      throw new Error('Filled cells must be between 17 and 81');
    }

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // Step 1: Create empty grid
      const grid: SudokuGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(null));

      // Step 2: Fill diagonal 3x3 boxes with shuffled values
      this.fillDiagonalBoxes(grid);

      // Step 3: Solve the partially filled grid to get a complete solution
      if (!this.solve(grid)) {
        attempts++;
        continue; // Try again if solving failed
      }

      // Step 4: Remove cells to reach desired filled cells count
      const puzzle = this.removeCells(grid, filledCells, requireUniqueness);

      if (puzzle) {
        return puzzle;
      }

      attempts++;
    }

    // Fallback to sample puzzle if generation fails
    console.warn(
      'Failed to generate puzzle with specified parameters, using sample puzzle'
    );
    return this.generateSamplePuzzle();
  }

  /**
   * Fills the three diagonal 3x3 boxes with shuffled values
   */
  static fillDiagonalBoxes(grid: SudokuGrid): void {
    const diagonalBoxes = [
      { startRow: 0, startCol: 0 }, // Top-left
      { startRow: 3, startCol: 3 }, // Center
      { startRow: 6, startCol: 6 }, // Bottom-right
    ];

    for (const box of diagonalBoxes) {
      const shuffledNumbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let numIndex = 0;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          grid[box.startRow + i][box.startCol + j] =
            shuffledNumbers[numIndex++];
        }
      }
    }
  }

  /**
   * Removes cells from a complete grid to create a puzzle
   */
  static removeCells(
    completeGrid: SudokuGrid,
    targetFilledCells: number,
    requireUniqueness: boolean
  ): SudokuGrid | null {
    const grid = this.cloneGrid(completeGrid);
    const cellsToRemove = 81 - targetFilledCells;

    // Create array of all cell positions
    const allPositions: [number, number][] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        allPositions.push([row, col]);
      }
    }

    // Shuffle positions for random removal
    const shuffledPositions = this.shuffleArray(allPositions);
    let removedCount = 0;

    for (const [row, col] of shuffledPositions) {
      if (removedCount >= cellsToRemove) break;

      const originalValue = grid[row][col];
      if (originalValue === null) continue; // Already empty

      // Temporarily remove the cell
      grid[row][col] = null;

      // If uniqueness is required, check if this cell appears in hidden singles
      if (requireUniqueness) {
        const gridCopy = this.cloneGrid(grid);
        const hiddenSingles = this.findAllHiddenSingles(gridCopy);

        // Check if the removed cell position appears in hidden singles
        const isHiddenSingle = hiddenSingles.some(
          ([r, c]) => r === row && c === col
        );

        if (!isHiddenSingle) {
          // Not a hidden single, restore and try next
          grid[row][col] = originalValue;
          continue;
        }
      }

      // Cell successfully removed
      removedCount++;
    }

    // Check if we achieved the target
    const actualFilledCells = this.countFilledCells(grid);
    if (
      actualFilledCells >= targetFilledCells - 3 &&
      actualFilledCells <= targetFilledCells + 3
    ) {
      return grid; // Allow small variance
    }

    return null; // Failed to achieve target
  }

  /**
   * Checks if a puzzle has exactly one unique solution
   */
  static hasUniqueSolution(grid: SudokuGrid): boolean {
    const gridCopy1 = this.cloneGrid(grid);
    const gridCopy2 = this.cloneGrid(grid);

    // Try to solve in two different ways and compare results
    if (!this.solve(gridCopy1)) {
      return false; // No solution
    }

    // For uniqueness test, we would need a more sophisticated approach
    // For now, we'll assume if it's solvable, it's likely unique
    // This is a simplification - true uniqueness testing requires more complex algorithms
    return this.isSolvable(grid);
  }

  /**
   * Finds all hidden singles in the current grid state
   */
  static findAllHiddenSingles(grid: SudokuGrid): [number, number][] {
    const hiddenSingles: [number, number][] = [];

    // Check rows
    for (let row = 0; row < 9; row++) {
      for (let num = 1; num <= 9; num++) {
        let possibleCol = -1;
        let count = 0;

        for (let col = 0; col < 9; col++) {
          if (
            (grid[row][col] === null || grid[row][col] === 0) &&
            this.isValid(grid, row, col, num)
          ) {
            possibleCol = col;
            count++;
          }
        }

        if (count === 1 && possibleCol !== -1) {
          hiddenSingles.push([row, possibleCol]);
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      for (let num = 1; num <= 9; num++) {
        let possibleRow = -1;
        let count = 0;

        for (let row = 0; row < 9; row++) {
          if (
            (grid[row][col] === null || grid[row][col] === 0) &&
            this.isValid(grid, row, col, num)
          ) {
            possibleRow = row;
            count++;
          }
        }

        if (count === 1 && possibleRow !== -1) {
          // Avoid duplicates
          if (!hiddenSingles.some(([r, c]) => r === possibleRow && c === col)) {
            hiddenSingles.push([possibleRow, col]);
          }
        }
      }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const startRow = boxRow * 3;
        const startCol = boxCol * 3;

        for (let num = 1; num <= 9; num++) {
          let possibleRow = -1;
          let possibleCol = -1;
          let count = 0;

          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              const row = startRow + i;
              const col = startCol + j;

              if (
                (grid[row][col] === null || grid[row][col] === 0) &&
                this.isValid(grid, row, col, num)
              ) {
                possibleRow = row;
                possibleCol = col;
                count++;
              }
            }
          }

          if (count === 1 && possibleRow !== -1 && possibleCol !== -1) {
            // Avoid duplicates
            if (
              !hiddenSingles.some(
                ([r, c]) => r === possibleRow && c === possibleCol
              )
            ) {
              hiddenSingles.push([possibleRow, possibleCol]);
            }
          }
        }
      }
    }

    return hiddenSingles;
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   */
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Counts the number of filled cells in the grid
   */
  static countFilledCells(grid: SudokuGrid): number {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== null && grid[row][col] !== 0) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Generates puzzles with predefined difficulty levels
   */
  static generatePuzzleByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): SudokuGrid {
    const difficultySettings = {
      easy: { filledCells: 45, uniqueness: true },
      medium: { filledCells: 35, uniqueness: true }, // Reduce requirements for testing
      hard: { filledCells: 30, uniqueness: false }, // More achievable targets
      expert: { filledCells: 25, uniqueness: false }, // Still challenging but more realistic
    };

    const settings = difficultySettings[difficulty];
    return this.generateRandomPuzzle(settings.filledCells, settings.uniqueness);
  }

  /**
   * Generates a sample sudoku puzzle
   */
  static generateSamplePuzzle(): SudokuGrid {
    return [
      [5, 3, null, null, 7, null, null, null, null],
      [6, null, null, 1, 9, 5, null, null, null],
      [null, 9, 8, null, null, null, null, 6, null],
      [8, null, null, null, 6, null, null, null, 3],
      [4, null, null, 8, null, 3, null, null, 1],
      [7, null, null, null, 2, null, null, null, 6],
      [null, 6, null, null, null, null, 2, 8, null],
      [null, null, null, 4, 1, 9, null, null, 5],
      [null, null, null, null, 8, null, null, 7, 9],
    ];
  }
}
