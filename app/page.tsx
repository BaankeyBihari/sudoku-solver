'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import SudokuGridComponent from '@/components/SudokuGrid';
import ThemeToggle from '@/components/ThemeToggle';
import { SudokuSolver } from '@/lib/sudokuSolver';
import { SudokuGrid, PossibleValuesGrid, ConflictsGrid } from '@/types/sudoku';
import {
  savePuzzleState,
  loadPuzzleState,
  clearPuzzleState,
  savePersonalBest,
  getPersonalBest,
  formatTime,
} from '@/lib/storage';

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

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [currentDifficulty, setCurrentDifficulty] = useState('sample');
  const [personalBest, setPersonalBest] = useState<number | undefined>(
    undefined
  );
  const [showNewRecord, setShowNewRecord] = useState(false);

  // Keyboard navigation state
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Refs for puzzle completion tracking
  const wasCompleteRef = useRef(false);

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

  // Timer useEffect - increments every second
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  // Auto-save puzzle state to localStorage
  useEffect(() => {
    if (!SudokuSolver.isGridComplete(grid)) {
      savePuzzleState({
        grid,
        initialGrid,
        difficulty: currentDifficulty,
        elapsedTime,
        timestamp: Date.now(),
        isCustomMode,
      });
    } else {
      // Clear auto-save when puzzle is complete
      clearPuzzleState();
    }
  }, [grid, initialGrid, currentDifficulty, elapsedTime, isCustomMode]);

  // Restore puzzle on mount
  useEffect(() => {
    const savedState = loadPuzzleState();
    if (savedState && !SudokuSolver.isGridComplete(savedState.grid)) {
      setGrid(savedState.grid);
      setInitialGrid(savedState.initialGrid);
      setCurrentDifficulty(savedState.difficulty);
      setElapsedTime(savedState.elapsedTime);
      setIsCustomMode(savedState.isCustomMode);
      setMessage('📂 Resumed your previous puzzle!');
    }

    // Load personal best for current difficulty
    const best = getPersonalBest(currentDifficulty);
    setPersonalBest(best);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Check for puzzle completion and trigger confetti
  useEffect(() => {
    const isComplete = SudokuSolver.isGridComplete(grid);

    if (isComplete && !wasCompleteRef.current && isValidState) {
      // Puzzle just became complete
      wasCompleteRef.current = true;
      setIsTimerRunning(false);

      // Confetti celebration!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Check and save personal best
      const best = getPersonalBest(currentDifficulty);
      if (!best || elapsedTime < best) {
        savePersonalBest(currentDifficulty, elapsedTime);
        setPersonalBest(elapsedTime);
        setShowNewRecord(true);
        setMessage(
          `🎉 Puzzle solved in ${formatTime(elapsedTime)}! NEW PERSONAL BEST! 🏆`
        );
        setTimeout(() => setShowNewRecord(false), 5000);
      } else {
        setMessage(
          `🎉 Puzzle solved in ${formatTime(elapsedTime)}! Personal best: ${formatTime(best)}`
        );
      }
    } else if (!isComplete && wasCompleteRef.current) {
      // Puzzle was modified after completion
      wasCompleteRef.current = false;
    }
  }, [grid, isValidState, elapsedTime, currentDifficulty]);

  const handleCellSelect = useCallback((row: number, col: number) => {
    // Toggle selection - clicking the same cell deselects it
    setSelectedCell(prev => {
      if (prev && prev.row === row && prev.col === col) {
        return null; // Deselect if clicking the same cell
      }
      return { row, col };
    });
  }, []);

  const handleCellChange = useCallback(
    (row: number, col: number, value: number | null) => {
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
    },
    [grid, isCustomMode, initialGrid]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;

      const { row, col } = selectedCell;

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        if (!isCustomMode && initialGrid[row][col] !== null) return; // Can't edit given cells
        const num = parseInt(e.key);
        handleCellChange(row, col, num);
        return;
      }

      // Delete or Backspace to clear
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isCustomMode && initialGrid[row][col] !== null) return;
        handleCellChange(row, col, null);
        return;
      }

      // Arrow keys for navigation
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(8, row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(8, col + 1);
          break;
        case 'Escape':
          setSelectedCell(null);
          // Blur the currently focused element
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          return;
        default:
          return;
      }

      if (newRow !== row || newCol !== col) {
        setSelectedCell({ row: newRow, col: newCol });
        // Blur the currently focused input to prevent double highlighting
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isCustomMode, initialGrid, handleCellChange]);

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

  const resetPuzzleTimer = (difficulty: string) => {
    setElapsedTime(0);
    setIsTimerRunning(true);
    setCurrentDifficulty(difficulty);
    wasCompleteRef.current = false;
    setShowNewRecord(false);
    const best = getPersonalBest(difficulty);
    setPersonalBest(best);
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
    resetPuzzleTimer('custom');
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
      resetPuzzleTimer('custom');
      setMessage('All entries cleared. Start fresh!');
    } else {
      // In normal mode, clear user entries but keep initial puzzle
      const clearedGrid = SudokuSolver.cloneGrid(initialGrid);
      setGrid(clearedGrid);
      setPossibleValues(SudokuSolver.getAllPossibleValues(clearedGrid));
      setConflicts(SudokuSolver.getConflictingCells(clearedGrid));
      resetPuzzleTimer(currentDifficulty);
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
        resetPuzzleTimer(difficulty);

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
        resetPuzzleTimer('sample');
      }

      setIsGenerating(false);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Sudoku Solver
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your puzzle and click solve, or use the sample puzzle
          </p>

          {/* Timer and Personal Best Display */}
          <div className="mt-4 flex flex-wrap justify-center gap-4 items-center">
            <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Time
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {personalBest !== undefined && (
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Personal Best
                </div>
                <div
                  className={`text-2xl font-bold font-mono ${
                    showNewRecord
                      ? 'text-green-600 dark:text-green-400 animate-pulse'
                      : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {formatTime(personalBest)} {showNewRecord && '🏆'}
                </div>
              </div>
            )}

            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
              💡 Use arrow keys to navigate • Number keys to fill • Backspace to
              clear
            </div>
          </div>

          {isCustomMode && (
            <div className="mt-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-800 dark:text-indigo-300 font-medium">
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
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
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
              className="px-6 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              Validate
            </button>

            <button
              onClick={togglePossibleValues}
              disabled={isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isCustomMode
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : showPossibleValues
                    ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-800/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
              }`}
            >
              {showPossibleValues ? 'Hide Hints' : 'Show Hints'}
            </button>

            <button
              onClick={fillObviousCells}
              disabled={!showPossibleValues || isCustomMode}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                showPossibleValues && !isCustomMode
                  ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2'
                  : message.includes('valid') || message.includes('solved')
                    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 rounded-lg px-4 py-2'
                    : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg px-4 py-2'
              }`}
            >
              {message}
            </div>
          )}

          {!isValidState && !message.includes('Invalid puzzle state') && (
            <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg px-4 py-2 text-lg font-medium">
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
