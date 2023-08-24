import sanitizeInput from "../lib/sanitizeInput";
import styles from "../styles/Game.module.scss";
import { useEffect, useState } from "react";
import initSudoku, { copy9x9Grid, init9x9Grid } from "../lib/gridGenerator";
import isValid from "../lib/isValid";

const Square = (props) => {

  const { val: value, allowed,
    rIdX, cIdX, updateCell, solved } = props;

  // useEffect(() => {
  //   console.log("Square rendered", props, isValid(props.squares, props.rIdX, props.cIdX, props.val))
  // }, [props])

  const handleChange = (e) => {
    e.preventDefault();
    updateCell(sanitizeInput(e));
    console.log("handleChange called", isValid(props.squares, rIdX, cIdX, sanitizeInput(e)))
  }

  return (
    <>
      {!solved ? (
        // value ? (
        <input
          className={styles["square"] + " " + styles[!isValid(props.squares, rIdX, cIdX, props.val) ? "invalid" : undefined] + " " + styles[allowed.length === 1 ? "single" : (allowed.length === 2 ? "double" : (allowed.length === 3 ? "triple" : undefined))] + " " + styles[rIdX % 3 === 0 ? "top" : undefined] + " " + styles[cIdX % 3 === 0 ? "left" : undefined + " " + styles[rIdX % 3 === 2 ? "bottom" : undefined] + " " + styles[cIdX % 3 === 2 ? "right" : undefined]]}
          type="number"
          id="square-val"
          name="square-val"
          maxLength="1"
          inputMode="numeric"
          onChange={(e) => handleChange(e)}
          placeholder={props.allowed.length === 1 ? props.allowed[0] : undefined}
          title={props.allowed.join(",")}
          min={0}
          max={9}
          value={value ? value : ""}
        ></input>
        // ) : (<input
        //   className={styles["square"] + " " + styles[props.invalid[props.rIdX][props.cIdX] ? "invalid" : undefined] + " " + styles[props.allowed.length === 1 ? "single" : (props.allowed.length === 2 ? "double" : (props.allowed.length === 3 ? "triple" : undefined))] + " " + styles[props.rIdX % 3 === 0 ? "top" : undefined] + " " + styles[props.cIdX % 3 === 0 ? "left" : undefined + " " + styles[props.rIdX % 3 === 2 ? "bottom" : undefined] + " " + styles[props.cIdX % 3 === 2 ? "right" : undefined]]}
        //   type="number"
        //   id="square-val"
        //   name="square-val"
        //   maxLength="1"
        //   inputMode="numeric"
        //   onChange={(e) => handleChange(e)}
        //   placeholder={props.allowed.length === 1 ? props.allowed[0] : undefined}
        //   title={props.allowed.join(",")}
        //   min={0}
        //   max={9}
        //   disabled={props.invalid.some((r, i) => r.some((c, j) => c && (props.rIdX !== i || props.cIdX !== j)))}
        //   value={""}
        // ></input>)
      ) : (
        <div className={styles.square}>{props.val}</div>
      )}
    </>
  );
};

export default Square;
