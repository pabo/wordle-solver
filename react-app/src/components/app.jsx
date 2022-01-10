import { Board } from "./board";
import { WordList } from "./wordlist";
import { observer } from "mobx-react-lite";

export const App = observer(({ store }) => {
  const { guessMap, candidateWordlist, addGuess, toggleLetterScore } = store;

  const wordSelectedHandler = (word) => {
    addGuess(word);
  };

  return (
    <div className="container">
      <Board guesses={guessMap} toggleLetterScore={toggleLetterScore}/>
      <WordList list={candidateWordlist} wordSelectedHandler={wordSelectedHandler} />
    </div>
  );
});
