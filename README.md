# Sudoku Solver

[![codecov](https://codecov.io/github/BaankeyBihari/sudoku-solver/branch/main/graph/badge.svg?token=68V5SFK097)](https://codecov.io/github/BaankeyBihari/sudoku-solver)
[![Tests](https://github.com/BaankeyBihari/sudoku-solver/workflows/Run%20Tests/badge.svg)](https://github.com/BaankeyBihari/sudoku-solver/actions)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)](https://nextjs.org/)

A modern, high-performance Sudoku solver and puzzle generator built with Next.js, TypeScript, and Tailwind CSS. This application features an optimized solving algorithm, intelligent puzzle generation, and an intuitive interface for creating, solving, and enjoying Sudoku puzzles.

## ✨ Features

### Core Functionality

- 🧮 **Interactive Sudoku grid** - Click-to-edit cells with real-time validation
- 🤖 **Lightning-fast solver** - Optimized backtracking with MCV heuristic (~10,000x faster than basic backtracking)
- � **Random puzzle generator** - Generate puzzles with customizable difficulty levels
- �🎨 **Custom puzzle creation** - Build your own Sudoku problems from scratch
- 🔍 **Real-time conflict detection** - Invalid entries highlighted in red instantly
- ✅ **Advanced validation** - Checks both rule compliance and solvability

### Smart Features

- 💡 **Intelligent hints system** - Show possible values for empty cells
- 🎯 **Smart highlighting** - Cells with single possibilities highlighted in green
- ⚡ **Auto-fill obvious cells** - One-click completion of cells with only one possibility
- 🧠 **Constraint propagation** - Advanced solving techniques beyond basic backtracking
- 🔍 **Hidden singles detection** - Finds cells that must contain specific values
- 🎚️ **Difficulty levels** - Easy, Medium, Hard, and Expert puzzle generation

### Puzzle Generation System

- 🔄 **Diagonal box filling strategy** - Creates valid starting grids efficiently
- 🎯 **Strategic cell removal** - Maintains puzzle uniqueness and solvability
- 📊 **Difficulty-based parameters** - Customizable filled cell counts and uniqueness requirements
- 🔒 **Uniqueness validation** - Ensures puzzles have exactly one solution (when required)
- 🎲 **Randomization** - Every generated puzzle is unique and different

### User Experience

- ✨ Clean, intuitive interface with contextual feedback
- 📱 Fully responsive design for all devices
- 🎨 Beautiful styling with Tailwind CSS and modal dialogs
- ⚠️ Smart validation warnings and error messages
- 🐳 Docker support for easy deployment

## Getting Started

### Prerequisites

- Node.js 22+
- Yarn package manager

### Development

1. **Install dependencies:**

```bash
yarn install
```

2. **Run the development server:**

```bash
yarn dev
```

3. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Code Quality

```bash
# Lint code and auto-fix issues
yarn lint:fix

# Strict linting (zero warnings)
yarn lint:check

# Type checking
yarn type-check

# Format code with Prettier
npx prettier --write .
```

### Production Build

```bash
yarn build
yarn start
```

### Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests individually with timeout
yarn test --testTimeout=30000
```

## 🎮 How to Use

### Random Puzzle Generation

1. **Generate new puzzles:** Click "Generate Random Puzzle" to open the difficulty selection modal
2. **Choose difficulty level:**
   - **Easy:** 45 filled cells, guaranteed unique solution
   - **Medium:** 35 filled cells, guaranteed unique solution
   - **Hard:** 30 filled cells, may have multiple solutions
   - **Expert:** 25 filled cells, may have multiple solutions
3. **Instant puzzle:** Click your preferred difficulty to generate a fresh puzzle
4. **Start solving:** The new puzzle loads immediately, ready to solve

### Creating Custom Puzzles

1. **Start fresh:** Click "Custom Puzzle" to begin with a blank 9×9 grid
2. **Enter your puzzle:** All cells become editable - input your Sudoku clues
3. **Validate as you go:** Invalid entries are highlighted in red immediately
4. **Finish setup:** Click "Finish Custom Puzzle" to lock your givens and validate solvability
5. **Ready to solve:** Use all solving features on your custom creation

### Solving Puzzles

1. **Input numbers:** Click empty cells and enter digits 1-9
2. **Get hints:** Toggle "Show Hints" to see possible values as small numbers in cells
3. **Spot opportunities:** Green cells have only one valid possibility
4. **Auto-fill:** Click "Fill Obvious" to complete all green-highlighted cells
5. **Validate progress:** Use "Validate" to check rules and solvability
6. **Solve instantly:** Click "Solve Puzzle" for automatic completion
7. **Start over:** Use "Clear Entries" to reset your progress

## 🚀 Performance Optimizations

### Advanced Solving Algorithm

- **Backtracking with MCV Heuristic** - Chooses cells with minimum candidate values first
- **Constraint Propagation** - Eliminates impossible values efficiently
- **Hidden Singles Detection** - Finds values that can only go in one cell
- **Early Validation** - Stops invalid branches immediately

### Puzzle Generation Algorithm

- **Diagonal Box Strategy** - Fills three diagonal 3×3 boxes with shuffled values for efficient valid grid creation
- **Strategic Cell Removal** - Randomly removes cells while maintaining solvability and uniqueness constraints
- **Hidden Singles Validation** - Uses advanced constraint propagation to ensure puzzle quality
- **Difficulty Calibration** - Adjusts filled cell counts and uniqueness requirements based on difficulty level

### Speed Improvements

- **~10,000x faster** than basic backtracking
- **Sub-millisecond solving** for most puzzles
- **Optimized data structures** for conflict checking
- **Smart pruning** reduces search space dramatically

## 📊 Test Coverage

- **100% coverage** on core solving algorithms (`lib/sudokuSolver.ts`)
- **100% coverage** on UI components (`components/SudokuGrid.tsx`)
- **86 comprehensive tests** covering edge cases, performance, and random puzzle generation
- **Jest + React Testing Library** for robust testing

### Coverage Visualization

[![codecov](https://codecov.io/github/BaankeyBihari/sudoku-solver/graphs/sunburst.svg?token=68V5SFK097)](https://codecov.io/gh/BaankeyBihari/sudoku-solver)

The sunburst chart above provides an interactive visualization of test coverage across the entire codebase:

- **Inner ring**: Top-level directories
- **Outer ring**: Individual files
- **Color coding**:
  - 🟢 **Green**: Excellent coverage (90-100%)
  - 🟡 **Yellow**: Good coverage (70-89%)
  - 🟠 **Orange**: Fair coverage (50-69%)
  - 🔴 **Red**: Poor coverage (<50%)
- **Size**: Proportional to file/directory size

Click the visualization to explore coverage details interactively on Codecov!

## 🏗️ Architecture

### Advanced Algorithm Details

The solver implements multiple sophisticated techniques:

1. **Most Constrained Variable (MCV) Heuristic**
   - Prioritizes cells with fewest possible values
   - Dramatically reduces branching factor
   - Leads to faster solution discovery

2. **Constraint Propagation**
   - Eliminates impossible values after each placement
   - Reduces candidate lists automatically
   - Catches contradictions early

3. **Hidden Singles Detection**
   - Finds cells where only one value is possible
   - Applies across rows, columns, and boxes
   - Fills obvious cells automatically

4. **Optimized Backtracking**
   - Efficient undo mechanism
   - Smart conflict detection
   - Early termination on invalid states

5. **Random Puzzle Generation**
   - Diagonal box filling for efficient grid creation
   - Strategic cell removal with uniqueness preservation
   - Difficulty-based parameter tuning
   - Fallback mechanisms for reliable generation

## 📁 Project Structure

```txt
├── .github/
│   └── workflows/
│       └── test.yml            # CI/CD pipeline configuration
├── .husky/                     # Git hooks configuration
│   ├── pre-commit             # Pre-commit linting and testing
│   └── commit-msg             # Commit message validation
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main Sudoku interface
│   └── globals.css             # Global styles and utilities
├── components/
│   └── SudokuGrid.tsx          # Interactive grid component
├── lib/
│   └── sudokuSolver.ts         # Optimized solving algorithms
├── types/
│   └── sudoku.ts               # TypeScript type definitions
├── public/                     # Static assets and favicons
│   ├── favicon.svg             # Main SVG favicon based on actual Sudoku grid
│   ├── favicon-16x16.svg       # Small size optimized favicon
│   ├── apple-touch-icon.svg    # iOS/macOS touch icon
│   ├── site.webmanifest        # Web app manifest for PWA support
│   └── browserconfig.xml       # Windows tile configuration
├── __tests__/
│   ├── sudokuSolver.test.ts    # Algorithm tests (84 tests)
│   └── SudokuGrid.test.tsx     # Component tests (2 tests)
├── coverage/                   # Test coverage reports (ignored)
├── .prettierrc                 # Prettier configuration
├── jest.config.js              # Jest configuration
├── renovate.json               # Renovate dependency update configuration
├── Dockerfile                  # Docker containerization
└── package.json                # Dependencies and scripts
```

## 🐳 Docker

### Build and run with Docker

```bash
# Build the image
docker build -t sudoku-solver .

# Run the container
docker run -p 3000:3000 sudoku-solver
```

### Docker Compose

```yaml
version: '3.8'
services:
  sudoku-solver:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
```

## 🛠️ Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Jest** - Testing framework with coverage
- **React Testing Library** - Component testing utilities
- **Docker** - Containerization platform

## 🔧 Development Workflow

### Code Quality Tools

- **ESLint** - Code linting with Next.js configuration
- **Prettier** - Code formatting with consistent style
- **TypeScript** - Static type checking
- **Husky** - Git hooks for pre-commit validation
- **lint-staged** - Run linters on staged files only
- **Renovate** - Automated dependency updates with intelligent grouping

### Git Hooks (Automatic)

The project includes pre-commit hooks that automatically run:

1. **Lint and fix** staged files
2. **Format code** with Prettier
3. **Type check** TypeScript
4. **Run tests** to ensure no regressions

These hooks ensure code quality and consistency across the team.

### CI/CD Pipeline

- **GitHub Actions** workflow runs on push/PR to main
- **Node.js 22.x** environment
- **Automated testing** with full coverage reporting
- **Build verification** ensures deployability
- **Codecov integration** for coverage tracking

### Automated Dependency Management

- **Renovate Bot** - Automated dependency updates scheduled for Monday mornings
- **Intelligent Grouping** - Related packages updated together (React, Next.js, TypeScript, etc.)
- **Security Updates** - Automatic security patches with immediate scheduling
- **Automerge Rules** - Patch updates and dev tools auto-merged after testing
- **Dependency Dashboard** - Centralized view of all pending updates in GitHub Issues

## 📈 Performance Benchmarks

- **Basic puzzles:** < 1ms solving time
- **Hard puzzles:** < 10ms solving time
- **Expert puzzles:** < 50ms solving time
- **Random puzzle generation:** < 100ms for most cases
- **Invalid puzzles:** Detected in < 1ms
- **Memory usage:** Optimized grid cloning and conflict tracking
- **UI responsiveness:** Real-time validation with no lag

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run test suite (`yarn test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using modern web technologies and advanced algorithmic optimization.
