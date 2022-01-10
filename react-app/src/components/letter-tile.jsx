export const LetterTile = ({ letter, evaluation = "", toggleLetter }) => {

  return <div className={`letter-tile ${evaluation}`} onClick={toggleLetter}>
    {letter}
    </div>;
};
