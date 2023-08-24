import styles from "../styles/Game.module.scss";
import { useState, useEffect } from "react";
import Board from "./Board";
import Square from "./Square";
import Solve from "./Solve";
import init9x9Grid, { copy9x9Grid, initSudoku } from "../lib/gridGenerator";
import analyze, { d2b } from "../lib/analyze";
import isValid from "../lib/isValid";

const Game = () => {
  const [squares, setSquares] = useState(initSudoku());
  const [solved, setSolved] = useState(false);
  const [allowed, setAllowed] = useState([]);
  const [invalid, setInvalid] = useState(false);
  const [nextMove, setNextMove] = useState(null);

  // Tracking state changes
  useEffect(() => {
    console.log("changes", squares, solved, allowed)
  }, [squares, solved, allowed])

  const analyzeBoard = () => {
    const binBoard = squares.map(r => r.map(c => c ? d2b(c) : 0))
    const analysis = analyze(binBoard)
    console.log("After analysis", analysis, binBoard)
    setAllowed(analysis.allowed)
  }

  // Analyze board
  useEffect(() => {
    const isBoardInvalid = () => {
      return squares.some((r, i) => r.some((c, j) => {
        if (!isValid(squares, i, j, c)) {
          return true
        }
        return false
      }))
    }
    if (!solved) {
      if (!isBoardInvalid()) {
        const binBoard = squares.map(r => r.map(c => c ? d2b(c) : 0))
        const analysis = analyze(binBoard)
        console.log("After analysis", analysis, binBoard)
        setAllowed(analysis.allowed)
        setSolved(analysis.allowed.every(r => r.every(c => c.length === 0)))
        if (analysis.allowed[analysis.bestRowIndex ?? 0][analysis.bestColIndex ?? 0].length)
          setNextMove({ row: analysis.bestRowIndex, col: analysis.bestColIndex, val: analysis.allowed[analysis.bestRowIndex ?? 0][analysis.bestColIndex ?? 0][0] })
      } else {
        console.log("board is invalid")
      }
    } else {
      console.log("analysis skipped as board is solved:", solved)
    }
  }, [squares, solved])

  // Handle Reset
  const handleReset = () => {
    setSquares(initSudoku());
    setInvalid(init9x9Grid(false));
    setSolved(false);
  }

  const updateCell = (row, col, val) => {
    const newSquares = initSudoku(squares)
    console.log("updateCell", row, col, val, squares, newSquares)
    newSquares[row][col] = 0 <= val && val <= 9 ? val : 0
    setSquares(newSquares)
  }



  return (
    <div className={styles.game}>
      <h1>Sudoku Solver</h1>
      <Board {...{ solved }}>
        {squares.map((row, rIdX) => row.map((el, cIdX) => <Square key={rIdX * 9 + cIdX} val={el} allowed={allowed.length ? allowed[rIdX][cIdX] : []} {...{
          rIdX, cIdX, updateCell: (val) => { updateCell(rIdX, cIdX, val) }, solved, squares
        }} />))}
      </Board>
      <Solve {...{ squares, setSquares, setSolved, solved, allowed, handleReset, nextMove, updateCell }} />
    </div>
  );
};

export default Game;
