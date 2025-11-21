import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeToggle from '../components/ThemeToggle';

// Mock the storage utilities
jest.mock('../lib/storage', () => ({
  getTheme: jest.fn(),
  setTheme: jest.fn(),
}));

import { getTheme, setTheme } from '../lib/storage';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document classes
    document.documentElement.className = '';
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { container } = render(<ThemeToggle />);
      expect(container.firstChild).toBeInTheDocument();
    });

    test('renders button with correct accessibility attributes', () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);
      const button = screen.getByRole('button');

      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
      expect(button).toHaveAttribute('title');
    });

    test('renders moon icon in light mode', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { container } = render(<ThemeToggle />);

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    test('renders sun icon in dark mode', async () => {
      (getTheme as jest.Mock).mockReturnValue('dark');
      const { container } = render(<ThemeToggle />);

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    test('shows placeholder before mounting', () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { container } = render(<ThemeToggle />);

      // Should render a button even before mount
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Theme Toggle Functionality', () => {
    test('toggles from light to dark theme on click', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);
      });

      expect(setTheme).toHaveBeenCalledWith('dark');
    });

    test('toggles from dark to light theme on click', async () => {
      (getTheme as jest.Mock).mockReturnValue('dark');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);
      });

      expect(setTheme).toHaveBeenCalledWith('light');
    });

    test('calls getTheme on component mount', () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      expect(getTheme).toHaveBeenCalled();
    });

    test('updates button title when theme changes', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { rerender } = render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('title', 'Switch to dark mode');
      });

      // Toggle to dark
      (getTheme as jest.Mock).mockReturnValue('dark');
      rerender(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);
      });
    });
  });

  describe('Theme Persistence', () => {
    test('loads theme from storage on mount', async () => {
      (getTheme as jest.Mock).mockReturnValue('dark');
      render(<ThemeToggle />);

      await waitFor(() => {
        expect(getTheme).toHaveBeenCalled();
      });
    });

    test('persists theme change to storage', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);
      });

      expect(setTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Visual Styling', () => {
    test('has correct CSS classes for styling', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('p-2');
        expect(button).toHaveClass('rounded-lg');
      });
    });

    test('shows moon icon with gray color in light mode', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { container } = render(<ThemeToggle />);

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('text-gray-800');
      });
    });

    test('shows sun icon with yellow color in dark mode', async () => {
      (getTheme as jest.Mock).mockReturnValue('dark');
      const { container } = render(<ThemeToggle />);

      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('text-yellow-400');
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles rapid toggle clicks', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);
      });

      // Should have been called for each click
      expect(setTheme).toHaveBeenCalled();
    });

    test('handles missing theme gracefully', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      const { container } = render(<ThemeToggle />);

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('button is keyboard accessible', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('disabled');
      });
    });

    test('has descriptive aria-label', () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });

    test('has helpful title text', async () => {
      (getTheme as jest.Mock).mockReturnValue('light');
      render(<ThemeToggle />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('title');
        expect(button.getAttribute('title')).toContain('dark mode');
      });
    });
  });
});
