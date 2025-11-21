import {
  savePuzzleState,
  loadPuzzleState,
  clearPuzzleState,
  savePersonalBest,
  getPersonalBest,
  getPersonalBests,
  formatTime,
  PuzzleState,
} from '../lib/storage';
import { SudokuGrid } from '../types/sudoku';

describe('Storage Utilities', () => {
  const mockGrid: SudokuGrid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatTime', () => {
    test('formats 0 seconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    test('formats seconds less than 60', () => {
      expect(formatTime(45)).toBe('0:45');
    });

    test('formats exactly 60 seconds as 1:00', () => {
      expect(formatTime(60)).toBe('1:00');
    });

    test('formats minutes and seconds', () => {
      expect(formatTime(125)).toBe('2:05');
    });

    test('formats large values correctly', () => {
      expect(formatTime(3661)).toBe('61:01');
    });

    test('pads single digit seconds with zero', () => {
      expect(formatTime(61)).toBe('1:01');
      expect(formatTime(305)).toBe('5:05');
    });

    test('handles edge case of 59 seconds', () => {
      expect(formatTime(59)).toBe('0:59');
    });

    test('handles multiple hours worth of seconds', () => {
      expect(formatTime(7200)).toBe('120:00');
    });
  });

  describe('Puzzle State Management', () => {
    const mockPuzzleState: PuzzleState = {
      grid: mockGrid,
      initialGrid: mockGrid,
      difficulty: 'easy',
      elapsedTime: 120,
      timestamp: Date.now(),
      isCustomMode: false,
    };

    test('saves and loads puzzle state', () => {
      savePuzzleState(mockPuzzleState);
      const loaded = loadPuzzleState();

      expect(loaded).toEqual(mockPuzzleState);
    });

    test('returns null when no saved state exists', () => {
      const loaded = loadPuzzleState();

      expect(loaded).toBeNull();
    });

    test('clears puzzle state', () => {
      savePuzzleState(mockPuzzleState);
      expect(loadPuzzleState()).toEqual(mockPuzzleState);

      clearPuzzleState();
      expect(loadPuzzleState()).toBeNull();
    });

    test('handles invalid JSON gracefully', () => {
      localStorage.setItem('sudoku_puzzle_state', 'invalid json');
      const loaded = loadPuzzleState();

      expect(loaded).toBeNull();
    });
  });

  describe('Personal Bests Management', () => {
    test('saves a new personal best', () => {
      const result = savePersonalBest('easy', 100);

      expect(result.easy).toBe(100);
      expect(getPersonalBest('easy')).toBe(100);
    });

    test('updates personal best if new time is better', () => {
      savePersonalBest('easy', 150);
      savePersonalBest('easy', 100);

      expect(getPersonalBest('easy')).toBe(100);
    });

    test('does not update if new time is worse', () => {
      savePersonalBest('easy', 100);
      savePersonalBest('easy', 150);

      expect(getPersonalBest('easy')).toBe(100);
    });

    test('saves multiple difficulty levels', () => {
      savePersonalBest('easy', 100);
      savePersonalBest('hard', 200);
      savePersonalBest('expert', 300);

      const bests = getPersonalBests();
      expect(bests).toEqual({ easy: 100, hard: 200, expert: 300 });
    });

    test('returns undefined for non-existent difficulty', () => {
      const best = getPersonalBest('unknown');

      expect(best).toBeUndefined();
    });

    test('returns empty object when no bests saved', () => {
      const bests = getPersonalBests();

      expect(bests).toEqual({});
    });

    test('handles invalid JSON in personal bests', () => {
      localStorage.setItem('sudoku_personal_bests', 'invalid json');
      const bests = getPersonalBests();

      expect(bests).toEqual({});
    });
  });

  describe('Integration Workflows', () => {
    test('complete puzzle state workflow', () => {
      const state: PuzzleState = {
        grid: mockGrid,
        initialGrid: mockGrid,
        difficulty: 'medium',
        elapsedTime: 180,
        timestamp: Date.now(),
        isCustomMode: false,
      };

      // Save state
      savePuzzleState(state);

      // Load state
      const loaded = loadPuzzleState();
      expect(loaded).toEqual(state);

      // Clear state
      clearPuzzleState();
      const cleared = loadPuzzleState();
      expect(cleared).toBeNull();
    });

    test('complete personal bests workflow', () => {
      // Save first best
      savePersonalBest('easy', 100);
      expect(getPersonalBest('easy')).toBe(100);

      // Try to save worse time
      savePersonalBest('easy', 150);
      expect(getPersonalBest('easy')).toBe(100); // Should still be 100

      // Save better time
      savePersonalBest('easy', 80);
      expect(getPersonalBest('easy')).toBe(80);

      // Save for different difficulty
      savePersonalBest('hard', 200);

      // Get all bests
      const allBests = getPersonalBests();
      expect(allBests).toEqual({ easy: 80, hard: 200 });
    });

    test('handles multiple operations across different features', () => {
      // Save puzzle state
      const state: PuzzleState = {
        grid: mockGrid,
        initialGrid: mockGrid,
        difficulty: 'hard',
        elapsedTime: 240,
        timestamp: Date.now(),
        isCustomMode: false,
      };
      savePuzzleState(state);

      // Save personal best
      savePersonalBest('hard', 240);

      // Verify both are saved independently
      expect(loadPuzzleState()).toEqual(state);
      expect(getPersonalBest('hard')).toBe(240);

      // Clear puzzle state
      clearPuzzleState();

      // Personal best should still exist
      expect(getPersonalBest('hard')).toBe(240);
    });
  });
});
