import React from 'react';
import { SudokuGrid, PossibleValuesGrid, ConflictsGrid } from '@/types/sudoku';

interface SudokuCellProps {
  value: number | null;
  onChange: (value: number | null) => void;
  isGiven: boolean;
  row: number;
  col: number;
  possibleValues: number[] | null;
  showPossibleValues: boolean;
  hasConflict: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  onChange,
  isGiven,
  row,
  col,
  possibleValues,
  showPossibleValues,
  hasConflict,
  isSelected,
  onSelect,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(null);
    } else {
      const num = parseInt(inputValue);
      if (num >= 1 && num <= 9) {
        onChange(num);
      }
    }
  };

  const getCellClasses = () => {
    let classes = 'relative w-12 h-12 text-center border border-gray-400 dark:border-gray-600 font-medium transition-all duration-200 focus:outline-none ';
    
    // Add thick borders for 3x3 box separation
    if (row % 3 === 0 && row !== 0) classes += 'border-t-2 border-t-black dark:border-t-white ';
    if (col % 3 === 0 && col !== 0) classes += 'border-l-2 border-l-black dark:border-l-white ';
    if (row === 8) classes += 'border-b-2 border-b-black dark:border-b-white ';
    if (col === 8) classes += 'border-r-2 border-r-black dark:border-r-white ';
    
    // Selection ring
    if (isSelected && !isGiven) {
      classes += 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 ';
    }
    
    // Style for given vs user-entered cells
    if (isGiven) {
      classes += 'bg-gray-200 dark:bg-gray-700 font-bold text-black dark:text-white text-lg cursor-not-allowed ';
    } else {
      classes += 'cursor-pointer ';
      // Check for conflicts first (highest priority)
      if (hasConflict && value !== null) {
        classes += 'bg-red-100 dark:bg-red-900/40 border-red-400 dark:border-red-500 text-red-800 dark:text-red-300 text-lg font-semibold animate-shake ';
      } else {
        // Check if this cell has only one possible value and should be highlighted
        const hasOnePossibleValue = showPossibleValues && 
                                    possibleValues && 
                                    possibleValues.length === 1 && 
                                    value === null;
        
        if (hasOnePossibleValue) {
          classes += 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-600 text-blue-600 dark:text-blue-300 text-lg animate-glow ';
        } else {
          classes += 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-300 text-lg ';
        }
      }
      // Fade in animation for newly entered values
      if (value !== null) {
        classes += 'animate-fadeIn ';
      }
    }
    
    return classes;
  };

  const renderPossibleValues = () => {
    if (!showPossibleValues || !possibleValues || possibleValues.length === 0 || value !== null) {
      return null;
    }

    // If there's only one possible value, show it larger and more prominently
    if (possibleValues.length === 1) {
      return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-lg font-semibold text-green-700 bg-green-200 rounded-full w-6 h-6 flex items-center justify-center">
            {possibleValues[0]}
          </div>
        </div>
      );
    }

    // Show all possible values in a 3x3 grid for cells with multiple possibilities
    return (
      <div className="absolute inset-0 grid grid-cols-3 gap-0 p-0.5 text-xs text-gray-400 pointer-events-none">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          <div
            key={num}
            className="flex items-center justify-center text-xs leading-none"
            style={{ fontSize: '8px' }}
          >
            {possibleValues.includes(num) ? num : ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        onClick={onSelect}
        disabled={isGiven}
        maxLength={1}
        className={getCellClasses()}
        readOnly={isGiven}
      />
      {renderPossibleValues()}
    </div>
  );
};

interface SudokuGridComponentProps {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  possibleValues: PossibleValuesGrid;
  conflicts: ConflictsGrid;
  showPossibleValues: boolean;
  isCustomMode: boolean;
  onCellChange: (row: number, col: number, value: number | null) => void;
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
}

const SudokuGridComponent: React.FC<SudokuGridComponentProps> = ({
  grid,
  initialGrid,
  possibleValues,
  conflicts,
  showPossibleValues,
  isCustomMode,
  onCellChange,
  selectedCell,
  onCellSelect,
}) => {
  return (
    <div className="inline-block border-2 border-black dark:border-white bg-black dark:bg-white p-1">
      <div className="grid grid-cols-9 gap-px">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onChange={(value) => onCellChange(rowIndex, colIndex, value)}
              isGiven={!isCustomMode && initialGrid[rowIndex][colIndex] !== null}
              row={rowIndex}
              col={colIndex}
              possibleValues={possibleValues[rowIndex][colIndex]}
              showPossibleValues={showPossibleValues}
              hasConflict={conflicts[rowIndex][colIndex]}
              isSelected={selectedCell !== null && selectedCell.row === rowIndex && selectedCell.col === colIndex}
              onSelect={() => onCellSelect(rowIndex, colIndex)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuGridComponent;
