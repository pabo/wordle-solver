import { Board } from "./board";
import { GuessList, CandidateList } from "./wordlists";
import { observer } from "mobx-react-lite";

export const App = observer(({ store }) => {
  const {
    currentSurvivors,
    guesses,
    sortedGuessesAndScores,
    addGuess,
    toggleLetterScore,
    progress,
  } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      {progress !== 100 && <div className="progress">{progress}</div>}
      <Board guesses={guesses} toggleLetterScore={toggleLetterScore} />
      <GuessList
        words={sortedGuessesAndScores}
        wordSelectedHandler={wordSelectedHandler}
      />
      <CandidateList words={currentSurvivors} />
    </div>
  );
});
