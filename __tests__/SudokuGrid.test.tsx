import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SudokuGrid from '../components/SudokuGrid';
import { SudokuGrid as GridType } from '../types/sudoku';

describe('SudokuGrid Component', () => {
  const mockGrid: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
  const mockPossibleValues = Array(9).fill(null).map(() => Array(9).fill(null));
  const mockConflicts = Array(9).fill(null).map(() => Array(9).fill(false));

  const defaultProps = {
    grid: mockGrid,
    initialGrid: mockGrid,
    possibleValues: mockPossibleValues,
    conflicts: mockConflicts,
    showPossibleValues: false,
    isCustomMode: false,
    onCellChange: jest.fn(),
    selectedCell: null,
    onCellSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<SudokuGrid {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('renders grid structure correctly', () => {
    const { container } = render(<SudokuGrid {...defaultProps} />);
    
    // Should have main grid container
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });

  test('handles grid with values', () => {
    const gridWithValues: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
    gridWithValues[0][0] = 5;
    gridWithValues[0][1] = 3;

    const { container } = render(
      <SudokuGrid {...defaultProps} grid={gridWithValues} initialGrid={gridWithValues} />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles possible values display', () => {
    const possibleValuesWithData = Array(9).fill(null).map(() => Array(9).fill(null));
    possibleValuesWithData[0][0] = [1, 2, 3];

    const { container } = render(
      <SudokuGrid 
        {...defaultProps} 
        possibleValues={possibleValuesWithData}
        showPossibleValues={true}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles conflicts display', () => {
    const conflictsWithError = Array(9).fill(null).map(() => Array(9).fill(false));
    conflictsWithError[0][0] = true;

    const { container } = render(
      <SudokuGrid {...defaultProps} conflicts={conflictsWithError} />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles custom mode', () => {
    const { container } = render(
      <SudokuGrid {...defaultProps} isCustomMode={true} />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('calls onCellChange when prop exists', () => {
    const mockOnCellChange = jest.fn();
    render(
      <SudokuGrid {...defaultProps} onCellChange={mockOnCellChange} />
    );
    
    // Component should render without issues
    expect(mockOnCellChange).not.toHaveBeenCalled();
  });

  test('handles single possibility highlighting', () => {
    const possibleValuesWithSingle = Array(9).fill(null).map(() => Array(9).fill(null));
    possibleValuesWithSingle[0][0] = [9]; // Single possible value

    const { container } = render(
      <SudokuGrid 
        {...defaultProps} 
        possibleValues={possibleValuesWithSingle}
        showPossibleValues={true}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  test('handles edge cases gracefully', () => {
    const possibleValuesWithNull = Array(9).fill(null).map(() => Array(9).fill(null));
    possibleValuesWithNull[0][0] = null;

    const { container } = render(
      <SudokuGrid 
        {...defaultProps} 
        possibleValues={possibleValuesWithNull}
        showPossibleValues={true}
      />
    );
    
    expect(container).toBeInTheDocument();
  });

  describe('User Input Handling', () => {
    test('handles valid number input', () => {
      const mockOnCellChange = jest.fn();
      const { container } = render(
        <SudokuGrid 
          {...defaultProps} 
          onCellChange={mockOnCellChange}
          isCustomMode={true}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Enter a valid number
      fireEvent.change(firstInput, { target: { value: '5' } });
      
      expect(mockOnCellChange).toHaveBeenCalledWith(0, 0, 5);
    });

    test('handles clearing cell input', () => {
      const mockOnCellChange = jest.fn();
      const gridWithValue: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
      gridWithValue[0][0] = 5;
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          grid={gridWithValue}
          onCellChange={mockOnCellChange}
          isCustomMode={true}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Clear the input
      fireEvent.change(firstInput, { target: { value: '' } });
      
      expect(mockOnCellChange).toHaveBeenCalledWith(0, 0, null);
    });

    test('rejects invalid number input', () => {
      const mockOnCellChange = jest.fn();
      const { container } = render(
        <SudokuGrid 
          {...defaultProps} 
          onCellChange={mockOnCellChange}
          isCustomMode={true}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Try entering invalid numbers
      fireEvent.change(firstInput, { target: { value: '0' } });
      expect(mockOnCellChange).not.toHaveBeenCalled();
      
      fireEvent.change(firstInput, { target: { value: '10' } });
      expect(mockOnCellChange).not.toHaveBeenCalled();
      
      fireEvent.change(firstInput, { target: { value: 'a' } });
      expect(mockOnCellChange).not.toHaveBeenCalled();
    });

    test('handles input in non-custom mode with given values', () => {
      const initialGrid: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
      initialGrid[0][0] = 5; // This is a "given" value
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          initialGrid={initialGrid}
          grid={initialGrid}
          isCustomMode={false}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Given cells should be disabled
      expect(firstInput).toBeDisabled();
    });
  });

  describe('Cell Styling and Conflicts', () => {
    test('displays conflict styling for cells with conflicts and values', () => {
      const gridWithConflict: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
      gridWithConflict[0][0] = 5; // Cell has a value
      
      const conflictsWithError = Array(9).fill(null).map(() => Array(9).fill(false));
      conflictsWithError[0][0] = true; // Cell has a conflict
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          grid={gridWithConflict}
          conflicts={conflictsWithError}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Should have conflict styling classes
      expect(firstInput).toHaveClass('bg-red-100');
      expect(firstInput).toHaveClass('border-red-400');
      expect(firstInput).toHaveClass('text-red-800');
    });

    test('displays given cell styling correctly', () => {
      const initialGrid: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
      initialGrid[0][0] = 5; // Given value
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          initialGrid={initialGrid}
          grid={initialGrid}
          isCustomMode={false}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Should have given cell styling
      expect(firstInput).toHaveClass('bg-gray-200');
      expect(firstInput).toHaveClass('font-bold');
    });

    test('displays single possible value highlighting', () => {
      const possibleValuesWithSingle = Array(9).fill(null).map(() => Array(9).fill(null));
      possibleValuesWithSingle[0][0] = [7]; // Single possible value
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          possibleValues={possibleValuesWithSingle}
          showPossibleValues={true}
        />
      );
      
      const firstInput = container.querySelector('input') as HTMLInputElement;
      
      // Should have single possibility highlighting
      expect(firstInput).toHaveClass('bg-green-100');
      expect(firstInput).toHaveClass('border-green-300');
    });

    test('displays multiple possible values correctly', () => {
      const possibleValuesWithMultiple = Array(9).fill(null).map(() => Array(9).fill(null));
      possibleValuesWithMultiple[0][0] = [1, 2, 3, 4, 5]; // Multiple possible values
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          possibleValues={possibleValuesWithMultiple}
          showPossibleValues={true}
        />
      );
      
      // Should render possible values in a grid
      const possibleValueElements = container.querySelectorAll('.text-xs');
      expect(possibleValueElements.length).toBeGreaterThan(0);
    });

    test('handles thick borders for 3x3 box separation', () => {
      const { container } = render(<SudokuGrid {...defaultProps} />);
      
      // Get all inputs to check border classes
      const inputs = container.querySelectorAll('input');
      
      // Check that we have the expected number of inputs (81)
      expect(inputs).toHaveLength(81);
      
      // Check specific border cases (e.g., cell at row 3, col 0 should have thick top border)
      // This tests the border styling logic in getCellClasses
      expect(inputs[27]).toHaveClass('border-t-2'); // Row 3, col 0 (index 27 = 3*9 + 0)
    });
  });

  describe('Possible Values Rendering', () => {
    test('does not render possible values when showPossibleValues is false', () => {
      const possibleValuesWithData = Array(9).fill(null).map(() => Array(9).fill(null));
      possibleValuesWithData[0][0] = [1, 2, 3];
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          possibleValues={possibleValuesWithData}
          showPossibleValues={false}
        />
      );
      
      // Should not find possible values elements when showPossibleValues is false
      const possibleValueGrid = container.querySelector('.grid-cols-3');
      expect(possibleValueGrid).not.toBeInTheDocument();
    });

    test('renders single possible value with special styling', () => {
      const possibleValuesWithSingle = Array(9).fill(null).map(() => Array(9).fill(null));
      possibleValuesWithSingle[0][0] = [9];
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          possibleValues={possibleValuesWithSingle}
          showPossibleValues={true}
        />
      );
      
      // Should find the single possible value with special styling
      const singleValueElement = container.querySelector('.bg-green-200');
      expect(singleValueElement).toBeInTheDocument();
      expect(singleValueElement).toHaveTextContent('9');
    });

    test('does not render possible values for cells with values', () => {
      const gridWithValue: GridType = Array(9).fill(null).map(() => Array(9).fill(null));
      gridWithValue[0][0] = 5;
      
      const possibleValuesWithData = Array(9).fill(null).map(() => Array(9).fill(null));
      possibleValuesWithData[0][0] = [1, 2, 3]; // This should be ignored since cell has value
      
      const { container } = render(
        <SudokuGrid 
          {...defaultProps}
          grid={gridWithValue}
          possibleValues={possibleValuesWithData}
          showPossibleValues={true}
        />
      );
      
      // Should not render possible values for cells that have values
      const firstCellContainer = container.querySelector('.relative');
      const possibleValuesGrid = firstCellContainer?.querySelector('.grid-cols-3');
      expect(possibleValuesGrid).not.toBeInTheDocument();
    });
  });
});
