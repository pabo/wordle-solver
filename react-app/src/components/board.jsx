import { GuessWord } from "./guess-word";
import { observer } from "mobx-react-lite";


// score1 takes precedence
const combineScoreKnownPositions = (guess, scoreArray, positionArray) => {
	console.log("score", scoreArray)
	console.log("positions", positionArray)
      
	let result = [];
      
	positionArray.forEach((position, index) => {
	  if (position === guess.split("")[index]) {
	    result.push('p')
	  }
      
	  else {
	    result.push(scoreArray[index])
	  }
      
	});
      
	return result.join("");
      }

export const Board = observer(({ guesses, toggleLetterScore, knownPositions }) => {
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
            score={combineScoreKnownPositions(guess, evaluation, knownPositions)}
            toggleLetterScore={toggleLetterScore}
          />
        );
      })}
      <GuessWord />
    </div>
  );
});
