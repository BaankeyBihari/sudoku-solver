import { SudokuGrid } from '@/types/sudoku';

// Types for stored data
export interface PuzzleState {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  difficulty: string;
  elapsedTime: number;
  timestamp: number;
  isCustomMode: boolean;
}

export interface PersonalBests {
  easy?: number;
  medium?: number;
  hard?: number;
  expert?: number;
  sample?: number;
}

// LocalStorage keys
const KEYS = {
  PUZZLE_STATE: 'sudoku_puzzle_state',
  PERSONAL_BESTS: 'sudoku_personal_bests',
  THEME: 'sudoku_theme',
};

// Puzzle State Management
export const savePuzzleState = (state: PuzzleState): void => {
  try {
    localStorage.setItem(KEYS.PUZZLE_STATE, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save puzzle state:', error);
  }
};

export const loadPuzzleState = (): PuzzleState | null => {
  try {
    const saved = localStorage.getItem(KEYS.PUZZLE_STATE);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to load puzzle state:', error);
    return null;
  }
};

export const clearPuzzleState = (): void => {
  try {
    localStorage.removeItem(KEYS.PUZZLE_STATE);
  } catch (error) {
    console.error('Failed to clear puzzle state:', error);
  }
};

// Personal Bests Management
export const savePersonalBest = (
  difficulty: string,
  time: number
): PersonalBests => {
  try {
    const bests = getPersonalBests();
    const currentBest = bests[difficulty as keyof PersonalBests];

    // Only save if it's a new record or first time
    if (!currentBest || time < currentBest) {
      bests[difficulty as keyof PersonalBests] = time;
      localStorage.setItem(KEYS.PERSONAL_BESTS, JSON.stringify(bests));
    }

    return bests;
  } catch (error) {
    console.error('Failed to save personal best:', error);
    return {};
  }
};

export const getPersonalBest = (difficulty: string): number | undefined => {
  try {
    const bests = getPersonalBests();
    return bests[difficulty as keyof PersonalBests];
  } catch (error) {
    console.error('Failed to get personal best:', error);
    return undefined;
  }
};

export const getPersonalBests = (): PersonalBests => {
  try {
    const saved = localStorage.getItem(KEYS.PERSONAL_BESTS);
    if (!saved) return {};
    return JSON.parse(saved);
  } catch (error) {
    console.error('Failed to get personal bests:', error);
    return {};
  }
};

// Theme Management
export const getTheme = (): 'light' | 'dark' => {
  try {
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Default to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  } catch (error) {
    console.error('Failed to get theme:', error);
    return 'light';
  }
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  try {
    localStorage.setItem(KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch (error) {
    console.error('Failed to set theme:', error);
  }
};

// Format time in MM:SS format
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
