import { Board } from "./board";
import { GuessList, CandidateList } from "./wordlists";
import { observer } from "mobx-react-lite";

export const App = observer(({ store }) => {
  const {
    candidateWords,
    madeGuesses,
    sortedGuessesAndScores,
    addGuess,
    toggleLetterScore,
    knownPositions
  } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      <Board guesses={madeGuesses} knownPositions={knownPositions} toggleLetterScore={toggleLetterScore} />
      <GuessList
        words={sortedGuessesAndScores}
        candidateWords={candidateWords}
        wordSelectedHandler={wordSelectedHandler}
	knownPositions={knownPositions}
      />
      <CandidateList words={candidateWords} />
    </div>
  );
});
