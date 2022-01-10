import { GuessWord } from "./guess-word";
import { observer } from "mobx-react-lite";

export const Board = observer(({ guesses }) => {
  console.log("guesses is", guesses);
  return (
    <div className="board">
      {guesses.map((guess, index) => (
        <GuessWord key={index} word={guess} />
      ))}
      <GuessWord />
    </div>
  );
});
