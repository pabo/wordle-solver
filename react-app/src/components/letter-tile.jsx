export const LetterTile = ({ letter, evaluation = "" }) => {
  return <div className={`letter-tile ${evaluation}`}>{letter}</div>;
};
