'use client';

import React, { useState, useEffect } from 'react';
import SudokuGridComponent from '@/components/SudokuGrid';
import { SudokuSolver } from '@/lib/sudokuSolver';
import { SudokuGrid, PossibleValuesGrid, ConflictsGrid } from '@/types/sudoku';

export default function Home() {
  const [grid, setGrid] = useState<SudokuGrid>(() =>
    SudokuSolver.generateSamplePuzzle()
  );
  const [initialGrid, setInitialGrid] = useState<SudokuGrid>(() =>
    SudokuSolver.cloneGrid(SudokuSolver.generateSamplePuzzle())
  );
  const [possibleValues, setPossibleValues] = useState<PossibleValuesGrid>(() =>
    SudokuSolver.getAllPossibleValues(SudokuSolver.generateSamplePuzzle())
  );
  const [conflicts, setConflicts] = useState<ConflictsGrid>(() =>
    SudokuSolver.getConflictingCells(SudokuSolver.generateSamplePuzzle())
  );
  const [showPossibleValues, setShowPossibleValues] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [message, setMessage] = useState('');
  const [isValidState, setIsValidState] = useState(true);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Update possible values whenever the grid changes
  useEffect(() => {
    if (showPossibleValues) {
      setPossibleValues(SudokuSolver.getAllPossibleValues(grid));
    }

    // Always check for conflicts and update the conflicts grid
    const newConflicts = SudokuSolver.getConflictingCells(grid);
    setConflicts(newConflicts);

    // Check if the current grid state is valid
    const gridIsValid = SudokuSolver.isGridValid(grid);
    setIsValidState(gridIsValid);

    if (!gridIsValid && message !== 'Solving...') {
      setMessage(
        '⚠️ Invalid puzzle state! Check for duplicate numbers in rows, columns, or boxes.'
      );
    } else if (gridIsValid && message.includes('Invalid puzzle state')) {
      setMessage(''); // Clear the invalid state message when grid becomes valid again
    }
  }, [grid, showPossibleValues, message]);

  const handleCellChange = (row: number, col: number, value: number | null) => {
    const newGrid = SudokuSolver.cloneGrid(grid);
    newGrid[row][col] = value;
    setGrid(newGrid);
    setMessage('');

    // If in custom mode, also update the initial grid to track user's problem
    if (isCustomMode) {
      const newInitialGrid = SudokuSolver.cloneGrid(initialGrid);
      newInitialGrid[row][col] = value;
      setInitialGrid(newInitialGrid);
    }
  };

  const solvePuzzle = async () => {
    if (isSolving) return;

    setIsSolving(true);
    setMessage('Solving...');

    // Create a copy to solve
    const gridToSolve = SudokuSolver.cloneGrid(grid);

    // Validate current state
    if (!SudokuSolver.isGridValid(gridToSolve)) {
      setMessage(
        'Cannot solve: Invalid puzzle state. Please fix conflicts first.'
      );
      setIsSolving(false);
      return;
    }

    // Add a small delay to show the solving state
    setTimeout(() => {
      const solved = SudokuSolver.solveAdvanced(gridToSolve);

      if (solved) {
        setGrid(gridToSolve);
        setConflicts(SudokuSolver.getConflictingCells(gridToSolve));
        setMessage('Puzzle solved! 🎉');
      } else {
        setMessage('No solution exists for this puzzle.');
      }

      setIsSolving(false);
    }, 100);
  };

  const createBlankPuzzle = () => {
    const blankGrid = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));
    setGrid(blankGrid);
    setInitialGrid(blankGrid);
    setPossibleValues(SudokuSolver.getAllPossibleValues(blankGrid));
    setConflicts(SudokuSolver.getConflictingCells(blankGrid));
    setIsCustomMode(true);
    setMessage('Enter your own puzzle! All cells are now editable.');
  };

  const finishCustomPuzzle = () => {
    if (isCustomMode) {
      // Validate the custom puzzle before finishing
      if (!SudokuSolver.isGridValid(grid)) {
        setMessage(
          '❌ Cannot finish: Puzzle has conflicts. Fix red cells first.'
        );
        return;
      }

      const isSolvable = SudokuSolver.isSolvable(grid);
      if (!isSolvable) {
        setMessage(
          '⚠️ Warning: This puzzle appears to have no solution. Continue anyway?'
        );
        // Still allow finishing, but warn the user
        setTimeout(() => {
          setIsCustomMode(false);
          setMessage(
            'Custom puzzle set with warning - it may not be solvable.'
          );
        }, 3000);
        return;
      }

      setIsCustomMode(false);
      setMessage(
        '✅ Custom puzzle completed and validated! Gray cells are now locked.'
      );
    }
  };

  const clearUserEntries = () => {
    if (isCustomMode) {
      // In custom mode, "Clear All" should create a completely blank grid
      const blankGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(null));
      setGrid(blankGrid);
      setInitialGrid(blankGrid);
      setPossibleValues(SudokuSolver.getAllPossibleValues(blankGrid));
      setConflicts(SudokuSolver.getConflictingCells(blankGrid));
      setMessage('All entries cleared. Start fresh!');
    } else {
      // In normal mode, clear user entries but keep initial puzzle
      const clearedGrid = SudokuSolver.cloneGrid(initialGrid);
      setGrid(clearedGrid);
      setPossibleValues(SudokuSolver.getAllPossibleValues(clearedGrid));
      setConflicts(SudokuSolver.getConflictingCells(clearedGrid));
      setMessage('');
    }
  };

  const validatePuzzle = () => {
    // Check if current state is valid
    if (!SudokuSolver.isGridValid(grid)) {
      setMessage(
        '❌ Puzzle state is invalid. Check for duplicates in rows, columns, or boxes.'
      );
      return;
    }

    // Check if it's solvable
    const isSolvable = SudokuSolver.isSolvable(grid);

    if (isSolvable) {
      setMessage('✅ Puzzle is valid and solvable!');
    } else {
      setMessage(
        '⚠️ Puzzle follows rules but has no solution. Check your given values.'
      );
    }
  };

  const togglePossibleValues = () => {
    const newShowState = !showPossibleValues;
    setShowPossibleValues(newShowState);
    if (newShowState) {
      setPossibleValues(SudokuSolver.getAllPossibleValues(grid));
    }
  };

  const fillObviousCells = () => {
    const newGrid = SudokuSolver.cloneGrid(grid);
    const currentPossibleValues = SudokuSolver.getAllPossibleValues(newGrid);
    let changed = false;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cellPossibleValues = currentPossibleValues[row][col];
        if (cellPossibleValues && cellPossibleValues.length === 1) {
          newGrid[row][col] = cellPossibleValues[0];
          changed = true;
        }
      }
    }

    if (changed) {
      setGrid(newGrid);
      setPossibleValues(SudokuSolver.getAllPossibleValues(newGrid));
      setConflicts(SudokuSolver.getConflictingCells(newGrid));
      setMessage('Filled cells with only one possible value! 💡');
    } else {
      setMessage('No obvious cells to fill.');
    }
  };

  const generateRandomPuzzle = async (
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ) => {
    setIsGenerating(true);
    setMessage(`Generating ${difficulty} puzzle...`);
    setShowDifficultyModal(false);

    // Add a small delay to show the generating state
    setTimeout(() => {
      try {
        const newPuzzle = SudokuSolver.generatePuzzleByDifficulty(difficulty);
        const newInitialGrid = SudokuSolver.cloneGrid(newPuzzle);

        setGrid(newPuzzle);
        setInitialGrid(newInitialGrid);
        setPossibleValues(SudokuSolver.getAllPossibleValues(newPuzzle));
        setConflicts(SudokuSolver.getConflictingCells(newPuzzle));
        setIsCustomMode(false);

        const filledCells = SudokuSolver.countFilledCells(newPuzzle);
        setMessage(
          `🎯 Generated ${difficulty} puzzle with ${filledCells} clues! Good luck!`
        );
      } catch (error) {
        console.error('Failed to generate puzzle:', error);
        setMessage(
          '❌ Failed to generate puzzle. Using sample puzzle instead.'
        );

        // Fallback to sample puzzle
        const samplePuzzle = SudokuSolver.generateSamplePuzzle();
        setGrid(samplePuzzle);
        setInitialGrid(SudokuSolver.cloneGrid(samplePuzzle));
        setPossibleValues(SudokuSolver.getAllPossibleValues(samplePuzzle));
        setConflicts(SudokuSolver.getConflictingCells(samplePuzzle));
      }

      setIsGenerating(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Sudoku Solver
          </h1>
          <p className="text-gray-600">
            Enter your puzzle and click solve, or use the sample puzzle
          </p>
          {isCustomMode && (
            <div className="mt-2 px-4 py-2 bg-indigo-100 border border-indigo-300 rounded-lg text-indigo-800 font-medium">
              🎨 Custom Puzzle Mode - All cells are editable
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-6">
          <SudokuGridComponent
            grid={grid}
            initialGrid={initialGrid}
            possibleValues={possibleValues}
            conflicts={conflicts}
            showPossibleValues={showPossibleValues}
            isCustomMode={isCustomMode}
            onCellChange={handleCellChange}
          />

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={solvePuzzle}
              disabled={isSolving || isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isSolving || isCustomMode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSolving ? 'Solving...' : 'Solve Puzzle'}
            </button>

            <button
              onClick={validatePuzzle}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Validate
            </button>

            <button
              onClick={togglePossibleValues}
              disabled={isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isCustomMode
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : showPossibleValues
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300'
              }`}
            >
              {showPossibleValues ? 'Hide Hints' : 'Show Hints'}
            </button>

            <button
              onClick={fillObviousCells}
              disabled={!showPossibleValues || isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                showPossibleValues && !isCustomMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Fill Obvious
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {isCustomMode ? (
              <button
                onClick={finishCustomPuzzle}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Finish Custom Puzzle
              </button>
            ) : (
              <button
                onClick={createBlankPuzzle}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Custom Puzzle
              </button>
            )}

            <button
              onClick={() => setShowDifficultyModal(true)}
              disabled={isGenerating || isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating || isCustomMode
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {isGenerating ? 'Generating...' : '🎲 Random Puzzle'}
            </button>

            <button
              onClick={clearUserEntries}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Clear Entries
            </button>
          </div>

          {message && (
            <div
              className={`text-lg font-medium ${
                message.includes('Invalid') ||
                message.includes('Cannot solve') ||
                message.includes('No solution')
                  ? 'text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2'
                  : message.includes('valid') || message.includes('solved')
                    ? 'text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2'
                    : 'text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2'
              }`}
            >
              {message}
            </div>
          )}

          {!isValidState && !message.includes('Invalid puzzle state') && (
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-lg font-medium">
              ⚠️ Invalid puzzle state detected! Red cells show conflicts.
            </div>
          )}

          <div className="max-w-2xl text-center space-y-4 mt-8">
            <h2 className="text-2xl font-semibold text-gray-800">How to Use</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">
                  Custom Puzzles
                </h3>
                <p>
                  Click &lsquo;Custom Puzzle&rsquo; to enter your own problem.
                  All cells become editable.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">
                  Input & Editing
                </h3>
                <p>
                  Click on empty cells to enter numbers 1-9. Gray cells are
                  locked given values.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">
                  Conflict Detection
                </h3>
                <p>
                  Invalid entries are highlighted in red. Fix conflicts before
                  solving the puzzle.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">Smart Hints</h3>
                <p>
                  Toggle &lsquo;Show Hints&rsquo; to see possible values for
                  empty cells as small numbers.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">
                  Enhanced Validation
                </h3>
                <p>
                  Validate checks both rule compliance and solvability to ensure
                  puzzle quality.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-800 mb-2">Auto-Fill</h3>
                <p>
                  Green cells have one solution. Use &lsquo;Fill Obvious&rsquo;
                  to auto-complete them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Selection Modal */}
        {showDifficultyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-mx-4 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Choose Difficulty Level
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => generateRandomPuzzle('easy')}
                    className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg">🟢 Easy</span>
                      <span className="text-sm opacity-90">~45 clues</span>
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      Perfect for beginners
                    </div>
                  </button>

                  <button
                    onClick={() => generateRandomPuzzle('medium')}
                    className="px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg">🟡 Medium</span>
                      <span className="text-sm opacity-90">~35 clues</span>
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      Good challenge with logical solving
                    </div>
                  </button>

                  <button
                    onClick={() => generateRandomPuzzle('hard')}
                    className="px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg">🟠 Hard</span>
                      <span className="text-sm opacity-90">~28 clues</span>
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      Requires advanced techniques
                    </div>
                  </button>

                  <button
                    onClick={() => generateRandomPuzzle('expert')}
                    className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-lg">🔴 Expert</span>
                      <span className="text-sm opacity-90">~22 clues</span>
                    </div>
                    <div className="text-sm opacity-80 mt-1">
                      For Sudoku masters only!
                    </div>
                  </button>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowDifficultyModal(false)}
                    className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
