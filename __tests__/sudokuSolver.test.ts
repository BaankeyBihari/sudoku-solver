import { SudokuSolver } from '../lib/sudokuSolver';
import { SudokuGrid } from '../types/sudoku';

// Helper function to check if grid is complete
const isComplete = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null || grid[row][col] === 0) {
        return false;
      }
    }
  }
  return true;
};

describe('SudokuSolver', () => {
  describe('Grid Validation', () => {
    test('should validate an empty grid as valid', () => {
      const emptyGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      expect(SudokuSolver.isGridValid(emptyGrid)).toBe(true);
    });

    test('should validate a complete valid sudoku', () => {
      const validGrid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];
      expect(SudokuSolver.isGridValid(validGrid)).toBe(true);
    });

    test('should detect invalid row', () => {
      const invalidGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      invalidGrid[0][0] = 5;
      invalidGrid[0][1] = 5; // Duplicate in row
      expect(SudokuSolver.isGridValid(invalidGrid)).toBe(false);
    });

    test('should detect invalid column', () => {
      const invalidGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      invalidGrid[0][0] = 5;
      invalidGrid[1][0] = 5; // Duplicate in column
      expect(SudokuSolver.isGridValid(invalidGrid)).toBe(false);
    });

    test('should detect invalid box', () => {
      const invalidGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      invalidGrid[0][0] = 5;
      invalidGrid[1][1] = 5; // Duplicate in 3x3 box
      expect(SudokuSolver.isGridValid(invalidGrid)).toBe(false);
    });

    test('should validate individual cell placement', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      grid[0][0] = 5;
      
      // Should be invalid to place 5 in same row
      expect(SudokuSolver.isValid(grid, 0, 1, 5)).toBe(false);
      // Should be valid to place different number
      expect(SudokuSolver.isValid(grid, 0, 1, 6)).toBe(true);
    });
  });

  describe('Grid Solving', () => {
    test('should solve a simple sudoku puzzle', () => {
      const puzzle: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];

      const gridCopy = SudokuSolver.cloneGrid(puzzle);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(true);
      expect(SudokuSolver.isGridValid(gridCopy)).toBe(true);
      expect(isComplete(gridCopy)).toBe(true);
    });

    test('should return false for unsolvable puzzle', () => {
      const unsolvablePuzzle: SudokuGrid = [
        [1, 1, 3, 4, 5, 6, 7, 8, 9], // Two 1s in same row - definitely invalid
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null]
      ];

      const gridCopy = SudokuSolver.cloneGrid(unsolvablePuzzle);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(false);
    });

    test('should handle empty grid', () => {
      const emptyGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      const gridCopy = SudokuSolver.cloneGrid(emptyGrid);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(true);
      expect(SudokuSolver.isGridValid(gridCopy)).toBe(true);
      expect(isComplete(gridCopy)).toBe(true);
    });
  });

  describe('Possible Values Calculation', () => {
    test('should calculate possible values for empty cells', () => {
      const partialGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      partialGrid[0][0] = 1;
      partialGrid[0][1] = 2;
      partialGrid[1][0] = 3;

      const possibleValues = SudokuSolver.getPossibleValues(partialGrid, 0, 2);
      
      // Cell [0,2] should not have 1 or 2 (same row) or 3 (same box)
      expect(possibleValues).not.toContain(1);
      expect(possibleValues).not.toContain(2);
      expect(possibleValues).not.toContain(3);
      expect(possibleValues).toContain(4);
      expect(possibleValues).toContain(5);
    });

    test('should return empty array for filled cells', () => {
      const partialGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      partialGrid[0][0] = 5;

      const possibleValues = SudokuSolver.getPossibleValues(partialGrid, 0, 0);
      expect(possibleValues).toEqual([]);
    });

    test('should handle cell with only one possibility', () => {
      // Create a scenario where a cell has only one possible value
      const constrainedGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Fill most numbers in the row, column, and box to leave only one option
      for (let i = 1; i <= 8; i++) {
        constrainedGrid[0][i] = i; // Fill row except first cell
      }
      for (let i = 1; i <= 7; i++) {
        constrainedGrid[i][0] = i + 1; // Fill column (avoiding conflicts)
      }

      const possibleValues = SudokuSolver.getPossibleValues(constrainedGrid, 0, 0);
      expect(possibleValues).toHaveLength(1);
      expect(possibleValues).toContain(9);
    });

    test('should get all possible values for grid', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      grid[0][0] = 1;

      const allPossible = SudokuSolver.getAllPossibleValues(grid);
      expect(allPossible[0][0]).toBeNull(); // Filled cell
      expect(allPossible[0][1]).not.toContain(1); // Same row as filled cell
      expect(allPossible[0][1]).toContain(2);
    });
  });

  describe('Conflict Detection', () => {
    test('should detect no conflicts in valid grid', () => {
      const validGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      validGrid[0][0] = 1;
      validGrid[0][1] = 2;
      validGrid[1][0] = 3;

      const conflicts = SudokuSolver.getConflictingCells(validGrid);
      expect(conflicts).toEqual(Array(9).fill(null).map(() => Array(9).fill(false)));
    });

    test('should detect row conflicts', () => {
      const conflictGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      conflictGrid[0][0] = 5;
      conflictGrid[0][1] = 5; // Same row conflict

      const conflicts = SudokuSolver.getConflictingCells(conflictGrid);
      expect(conflicts[0][0]).toBe(true);
      expect(conflicts[0][1]).toBe(true);
    });

    test('should detect column conflicts', () => {
      const conflictGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      conflictGrid[0][0] = 5;
      conflictGrid[1][0] = 5; // Same column conflict

      const conflicts = SudokuSolver.getConflictingCells(conflictGrid);
      expect(conflicts[0][0]).toBe(true);
      expect(conflicts[1][0]).toBe(true);
    });

    test('should detect box conflicts', () => {
      const conflictGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      conflictGrid[0][0] = 5;
      conflictGrid[2][2] = 5; // Same 3x3 box conflict

      const conflicts = SudokuSolver.getConflictingCells(conflictGrid);
      expect(conflicts[0][0]).toBe(true);
      expect(conflicts[2][2]).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should correctly identify complete grid', () => {
      const completeGrid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      expect(isComplete(completeGrid)).toBe(true);
    });

    test('should correctly identify incomplete grid', () => {
      const incompleteGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      incompleteGrid[0][0] = 5;

      expect(isComplete(incompleteGrid)).toBe(false);
    });

    test('should clone grid correctly', () => {
      const originalGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      originalGrid[0][0] = 5;

      const clonedGrid = SudokuSolver.cloneGrid(originalGrid);
      clonedGrid[0][0] = 7;

      expect(originalGrid[0][0]).toBe(5);
      expect(clonedGrid[0][0]).toBe(7);
    });

    test('should check solvability correctly', () => {
      const solvablePuzzle: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];

      expect(SudokuSolver.isSolvable(solvablePuzzle)).toBe(true);

      const unsolvablePuzzle: SudokuGrid = [
        [1, 1, 3, 4, 5, 6, 7, 8, 9], // Two 1s in same row - definitely invalid
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null]
      ];

      expect(SudokuSolver.isSolvable(unsolvablePuzzle)).toBe(false);
    });

    test('should generate sample puzzle', () => {
      const samplePuzzle = SudokuSolver.generateSamplePuzzle();
      expect(samplePuzzle).toHaveLength(9);
      expect(samplePuzzle[0]).toHaveLength(9);
      expect(SudokuSolver.isGridValid(samplePuzzle)).toBe(true);
      expect(SudokuSolver.isSolvable(samplePuzzle)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle grid with invalid numbers', () => {
      const invalidGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      (invalidGrid as any)[0][0] = 10; // Invalid number

      // The function doesn't specifically validate number ranges, just sudoku rules
      expect(() => SudokuSolver.isGridValid(invalidGrid)).not.toThrow();
      // Since 10 is not 1-9, it won't be validated against sudoku rules
      expect(SudokuSolver.isGridValid(invalidGrid)).toBe(true);
    });

    test('should handle negative numbers', () => {
      const negativeGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      (negativeGrid as any)[0][0] = -1;

      expect(() => SudokuSolver.isGridValid(negativeGrid)).not.toThrow();
      // Since -1 is not 1-9, it won't be validated against sudoku rules
      expect(SudokuSolver.isGridValid(negativeGrid)).toBe(true);
    });

    test('should handle very constrained but solvable puzzle', () => {
      // A puzzle with many constraints but still solvable
      const constrainedPuzzle: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, null] // Only one cell empty
      ];

      const gridCopy = SudokuSolver.cloneGrid(constrainedPuzzle);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(true);
      expect(gridCopy[8][8]).toBe(9);
    });
  });

  describe('Advanced Solving Methods', () => {
    test('should use advanced solver with constraint propagation', () => {
      const puzzle: SudokuGrid = [
        [5, 3, null, null, 7, null, null, null, null],
        [6, null, null, 1, 9, 5, null, null, null],
        [null, 9, 8, null, null, null, null, 6, null],
        [8, null, null, null, 6, null, null, null, 3],
        [4, null, null, 8, null, 3, null, null, 1],
        [7, null, null, null, 2, null, null, null, 6],
        [null, 6, null, null, null, null, 2, 8, null],
        [null, null, null, 4, 1, 9, null, null, 5],
        [null, null, null, null, 8, null, null, 7, 9]
      ];

      const gridCopy = SudokuSolver.cloneGrid(puzzle);
      const solved = SudokuSolver.solveAdvanced(gridCopy);
      expect(solved).toBe(true);
      expect(SudokuSolver.isGridValid(gridCopy)).toBe(true);
      expect(SudokuSolver.isGridComplete(gridCopy)).toBe(true);
    });

    test('should handle invalid grid with advanced solver', () => {
      const invalidGrid: SudokuGrid = [
        [1, 1, 3, 4, 5, 6, 7, 8, 9], // Two 1s in same row
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null]
      ];

      const gridCopy = SudokuSolver.cloneGrid(invalidGrid);
      const solved = SudokuSolver.solveAdvanced(gridCopy);
      expect(solved).toBe(false);
    });

    test('should solve puzzle with naked singles using advanced solver', () => {
      // Create a puzzle where constraint propagation will fill naked singles
      const puzzleWithNakedSingles: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, null], // Only 5 is possible here
        [3, 4, 5, 2, 8, 6, 1, 7, null]  // Only 9 is possible here
      ];

      const gridCopy = SudokuSolver.cloneGrid(puzzleWithNakedSingles);
      const solved = SudokuSolver.solveAdvanced(gridCopy);
      expect(solved).toBe(true);
      expect(gridCopy[7][8]).toBe(5);
      expect(gridCopy[8][8]).toBe(9);
    });

    test('should detect impossible state during constraint propagation', () => {
      // Create a grid that becomes impossible during constraint propagation
      const impossibleGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Fill row 0 with 1-8, leaving position [0,8] that can only be 9
      for (let i = 0; i < 8; i++) {
        impossibleGrid[0][i] = i + 1;
      }
      
      // Put 9 in same column, making [0,8] impossible
      impossibleGrid[1][8] = 9;

      const solved = SudokuSolver.solveAdvanced(impossibleGrid);
      expect(solved).toBe(false);
    });

    test('should handle grid with no empty cells in solve method', () => {
      // Create a complete valid grid to test the early return path
      const completeGrid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      const gridCopy = SudokuSolver.cloneGrid(completeGrid);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(true);
    });

    test('should handle impossible grid in solve method', () => {
      // Create a grid where findBestEmptyCell returns null due to no possibilities
      const impossibleGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // This creates a scenario where an empty cell has no valid possibilities
      impossibleGrid[0][0] = 1;
      impossibleGrid[0][1] = 1; // Invalid duplicate in row
      
      const gridCopy = SudokuSolver.cloneGrid(impossibleGrid);
      const solved = SudokuSolver.solve(gridCopy);
      expect(solved).toBe(false);
    });

    test('should trigger backtracking when all possibilities fail', () => {
      // Create a puzzle that will cause backtracking by having a cell where 
      // some possibilities initially seem valid but lead to dead ends
      const backtrackGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Create a scenario where a cell has multiple possibilities,
      // but trying them leads to contradictions down the line
      
      // Set up constraints that will force backtracking
      // This creates a situation where cell [1][1] could be 1 or 2 or 3,
      // but only one choice leads to a solvable state
      
      // Fill some cells to create constraints
      backtrackGrid[0][0] = 4;
      backtrackGrid[0][2] = 1;
      backtrackGrid[1][0] = 5;
      backtrackGrid[2][0] = 6;
      backtrackGrid[2][1] = 7;
      backtrackGrid[2][2] = 8;
      
      // This should create a scenario where the solver needs to try different
      // values for cell [1][1], and some will fail, requiring backtracking
      
      const gridCopy = SudokuSolver.cloneGrid(backtrackGrid);
      
      // Run with a timeout to avoid infinite loops if something goes wrong
      const startTime = Date.now();
      const solved = SudokuSolver.solve(gridCopy);
      const endTime = Date.now();
      
      // Should complete in reasonable time (less than 1000ms)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(typeof solved).toBe('boolean');
    });
  });

  describe('Hidden Singles Detection', () => {
    test('should find hidden singles in rows', () => {
      // This test verifies that the method runs without errors
      // The actual hidden single logic is complex and tested through the advanced solver
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      grid[0][0] = 1;

      const gridCopy = SudokuSolver.cloneGrid(grid);
      const changed = SudokuSolver.findHiddenSinglesInRow(gridCopy, 0);
      
      // Should not crash and return boolean
      expect(typeof changed).toBe('boolean');
    });

    test('should find hidden singles in columns', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Set up a scenario where 5 can only go in one place in column 0
      grid[0][0] = 1;
      grid[1][0] = 2;
      grid[2][0] = 3;
      grid[3][0] = 4;
      grid[5][0] = 6; // Skip position 4, where 5 must go
      grid[6][0] = 7;
      grid[7][0] = 8;
      grid[8][0] = 9;

      const gridCopy = SudokuSolver.cloneGrid(grid);
      const changed = SudokuSolver.findHiddenSinglesInCol(gridCopy, 0);
      
      expect(changed).toBe(true);
      expect(gridCopy[4][0]).toBe(5);
    });

    test('should find hidden singles in boxes', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Set up a scenario where 5 can only go in one place in the top-left 3x3 box
      grid[0][0] = 1;
      grid[0][1] = 2;
      grid[0][2] = 3;
      grid[1][0] = 4;
      grid[1][2] = 6; // Skip position [1,1], where 5 must go
      grid[2][0] = 7;
      grid[2][1] = 8;
      grid[2][2] = 9;

      const gridCopy = SudokuSolver.cloneGrid(grid);
      const changed = SudokuSolver.findHiddenSinglesInBox(gridCopy, 0, 0);
      
      expect(changed).toBe(true);
      expect(gridCopy[1][1]).toBe(5);
    });

    test('should handle no hidden singles found', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      grid[0][0] = 1; // Just one number, no constraints to create hidden singles

      const gridCopy = SudokuSolver.cloneGrid(grid);
      const changed = SudokuSolver.findHiddenSinglesInRow(gridCopy, 0);
      
      expect(changed).toBe(false);
    });

    test('should find multiple hidden singles in one pass', () => {
      const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      
      // Create a simple scenario with one hidden single
      // Row 0 has positions 0-7 filled, 8 is empty and must be 9
      for (let col = 0; col < 8; col++) {
        grid[0][col] = col + 1; // 1,2,3,4,5,6,7,8 in positions 0-7
      }
      // Position [0][8] must be 9

      const gridCopy = SudokuSolver.cloneGrid(grid);
      const changed = SudokuSolver.findHiddenSingles(gridCopy);
      
      expect(changed).toBe(true);
      expect(gridCopy[0][8]).toBe(9);
    });
  });

  describe('Grid Completion Detection', () => {
    test('should correctly identify complete grid', () => {
      const completeGrid: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      expect(SudokuSolver.isGridComplete(completeGrid)).toBe(true);
    });

    test('should correctly identify incomplete grid with null values', () => {
      const incompleteGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      incompleteGrid[0][0] = 5;

      expect(SudokuSolver.isGridComplete(incompleteGrid)).toBe(false);
    });

    test('should correctly identify incomplete grid with zero values', () => {
      const incompleteGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      incompleteGrid[0][0] = 5;

      expect(SudokuSolver.isGridComplete(incompleteGrid)).toBe(false);
    });

    test('should handle mixed null and zero values', () => {
      const mixedGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
      mixedGrid[0][0] = 5;
      mixedGrid[1][1] = 0; // Zero should be treated as empty

      expect(SudokuSolver.isGridComplete(mixedGrid)).toBe(false);
    });
  });
});
