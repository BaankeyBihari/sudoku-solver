import styles from "../styles/Game.module.scss";
const Board = (props) => {
  const {solved, ...rest} = props;
  const colorScheme = solved ? "rgb" : undefined;
  return <div className={styles["board"] + " " + styles[colorScheme]} {...rest} />;
};

export default Board;
