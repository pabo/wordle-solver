import { GuessWord } from "./guess-word";
import { observer } from "mobx-react-lite";

export const Board = observer(({ guesses, toggleLetterScore }) => {
  return (
    <div className="board">
      {guesses.map(({ word, evaluation }) => {
        return (
          <GuessWord
            key={word}
            word={word}
            score={evaluation}
            toggleLetterScore={toggleLetterScore}
          />
        );
      })}
      <GuessWord />
    </div>
  );
});
