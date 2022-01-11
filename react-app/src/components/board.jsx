import { GuessWord } from "./guess-word";
import { observer } from "mobx-react-lite";

export const Board = observer(({ guesses, toggleLetterScore }) => {
  return (
    <div className="board">
      {guesses.map(({ guess, evaluation }) => {
        const toggleLetter = (position) => {
          toggleLetterScore(position);
        };

        return (
          <GuessWord
            key={guess}
            word={guess}
            score={evaluation}
            toggleLetterScore={toggleLetterScore}
          />
        );
      })}
      <GuessWord />
    </div>
  );
});
