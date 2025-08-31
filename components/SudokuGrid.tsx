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
    let classes = 'relative w-12 h-12 text-center border border-gray-400 font-medium ';
    
    // Add thick borders for 3x3 box separation
    if (row % 3 === 0 && row !== 0) classes += 'border-t-2 border-t-black ';
    if (col % 3 === 0 && col !== 0) classes += 'border-l-2 border-l-black ';
    if (row === 8) classes += 'border-b-2 border-b-black ';
    if (col === 8) classes += 'border-r-2 border-r-black ';
    
    // Style for given vs user-entered cells
    if (isGiven) {
      classes += 'bg-gray-200 font-bold text-black text-lg ';
    } else {
      // Check for conflicts first (highest priority)
      if (hasConflict && value !== null) {
        classes += 'bg-red-100 border-red-400 text-red-800 text-lg font-semibold ';
      } else {
        // Check if this cell has only one possible value and should be highlighted
        const hasOnePossibleValue = showPossibleValues && 
                                    possibleValues && 
                                    possibleValues.length === 1 && 
                                    value === null;
        
        if (hasOnePossibleValue) {
          classes += 'bg-green-100 border-green-300 text-blue-600 text-lg ';
        } else {
          classes += 'bg-white text-blue-600 text-lg ';
        }
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
        disabled={isGiven}
        maxLength={1}
        className={getCellClasses()}
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
}

const SudokuGridComponent: React.FC<SudokuGridComponentProps> = ({
  grid,
  initialGrid,
  possibleValues,
  conflicts,
  showPossibleValues,
  isCustomMode,
  onCellChange,
}) => {
  return (
    <div className="inline-block border-2 border-black bg-black p-1">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuGridComponent;
