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
    isLoadingFitness,
    isLoadingSurvivorMap,
  } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      {isLoadingSurvivorMap && <div>Loading survivor map...</div>}
      <Board guesses={guesses} toggleLetterScore={toggleLetterScore} />
      <GuessList
        isLoading={isLoadingFitness}
        words={sortedGuessesAndScores}
        wordSelectedHandler={wordSelectedHandler}
      />
      <CandidateList
        words={currentSurvivors}
        wordSelectedHandler={wordSelectedHandler}
      />
    </div>
  );
});
