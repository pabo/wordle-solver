import { GuessWord } from "./guess-word";
import { observer } from "mobx-react-lite";

export const Board = observer(({ guesses, toggleLetterScore }) => {
  return (
    <div className="board">
      {Array.from(guesses.entries()).map(([word, score]) => {
  		const toggleLetter = (position) => {
			  console.log("got to here")
			  toggleLetterScore(word, position);
		}

        	return <GuessWord key={word} word={word} score={score} toggleLetter={toggleLetter}/>
	      })}
      <GuessWord />
    </div>
  );
});
