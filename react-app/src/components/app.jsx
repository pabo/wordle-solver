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
  } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      <Board guesses={madeGuesses} toggleLetterScore={toggleLetterScore} />
      <GuessList
        words={sortedGuessesAndScores}
	candidateWords={candidateWords}
        wordSelectedHandler={wordSelectedHandler}
      />
      <CandidateList words={candidateWords} />
    </div>
  );
});
