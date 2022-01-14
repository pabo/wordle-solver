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
    knownAnswer,
  } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      {isLoadingSurvivorMap && <div>Loading survivor map...</div>}
      <Board
        knownAnswer={knownAnswer}
        guesses={guesses}
        toggleLetterScore={toggleLetterScore}
      />
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
