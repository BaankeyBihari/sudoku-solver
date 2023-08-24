import styles from "../styles/Game.module.scss";
import solveSudoku from "../lib/solveSudoku";
import solveSudokuByBackTrackingWithMRV from "../lib/backTrackingWithMRV";
import solveSudokuByBackTracking from "../lib/backTracking";
import initSudoku, { init9x9Grid } from "../lib/gridGenerator";
import Timer from "./Timer";
import { useState } from "react";
import isValid from "../lib/isValid";

const Solve = (props) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const handleClick = (choice) => {
    let solvedSquares;
    let updatedSquares;
    switch (choice) {
      case "solve":
        setStart(Math.floor(Date.now()));
        solvedSquares = solveSudoku(props.squares);
        props.setSquares(solvedSquares);
        props.setSolved(true);
        setEnd(Math.floor(Date.now()));
        break;
      case "solveWithBackTrackingWithMRV":
        setStart(Math.floor(Date.now()));
        solvedSquares = solveSudokuByBackTrackingWithMRV(props.squares);
        props.setSquares(solvedSquares);
        props.setSolved(true);
        setEnd(Math.floor(Date.now()));
        break;
      case "solveWithBackTracking":
        setStart(Math.floor(Date.now()));
        solvedSquares = solveSudokuByBackTracking(props.squares);
        props.setSquares(solvedSquares);
        props.setSolved(true);
        setEnd(Math.floor(Date.now()));
        break;
      case "next":
        setStart(Math.floor(Date.now()));
        updatedSquares = initSudoku();
        console.log("updatedSquares: ", updatedSquares)
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            updatedSquares[i][j] = props.squares[i][j];
            if (props.allowed[i][j].length === 1) {
              updatedSquares[i][j] = props.allowed[i][j][0];
            }
          }
        }
        props.setSquares(updatedSquares);
        setEnd(Math.floor(Date.now()));
        break;
      case "nextMove":
        setStart(Math.floor(Date.now()));
        props.updateCell(props.nextMove.row, props.nextMove.col, props.nextMove.val);
        setEnd(Math.floor(Date.now()));
        break;
      case "reset":
        setStart(null);
        setEnd(null);
        console.log("reset called")
        props.handleReset();
        break;
      default:
        setStart(null);
        setEnd(null);
    }
  };

  return (
    <>
      <div className={styles.solve}>
        <button
          id={styles.solveBtn}
          disabled={props.solved || props.squares.some((r, i) => r.some((c, j) => !isValid(props.squares, i, j, c)))}
          onClick={() => {
            handleClick("solve");
          }}
        >
          Sudoku Solve 🤠
        </button>
      </div>
      <div className={styles.solve}>
        <button
          id={styles.solveBtn}
          disabled={props.solved || props.squares.some((r, i) => r.some((c, j) => !isValid(props.squares, i, j, c)))}
          onClick={() => {
            handleClick("solveWithBackTracking");
          }}
        >
          Sudoku Solve BackTracking 🤠
        </button>
        <button
          id={styles.solveBtn}
          disabled={props.solved || props.squares.some((r, i) => r.some((c, j) => !isValid(props.squares, i, j, c)))}
          onClick={() => {
            handleClick("solveWithBackTrackingWithMRV");
          }}
        >
          Sudoku Solve MRV 🤠
        </button>
      </div>
      <div className={styles.solve}>
        <button
          id={styles.solveBtn}
          disabled={props.solved || props.squares.some((r, i) => r.some((c, j) => !isValid(props.squares, i, j, c)))}
          onClick={() => {
            handleClick("next");
          }}
        >
          Next Board ➡️
        </button>
        <button
          id={styles.solveBtn}
          disabled={props.solved || props.squares.some((r, i) => r.some((c, j) => !isValid(props.squares, i, j, c)))}
          onClick={() => {
            handleClick("nextMove");
          }}
        >
          Next Move ➡️
        </button>
      </div>
      <div className={styles.solve}>
        <button
          id={styles.resetBtn}
          onClick={() => {
            handleClick("reset");
          }}
        >
          Reset Board 🔄
        </button>
      </div>
      <Timer {...{ start, end }} />
    </>
  );
};

export default Solve;
