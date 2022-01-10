import { Board } from "./board";
import { WordList } from "./wordlist";
import { observer } from "mobx-react-lite";

export const App = observer(({ store }) => {
  const { guesses, wordlist, addGuess } = store;

  const wordSelectedHandler = (word) => {
    console.log("adding guess");
    addGuess(word);
  };

  return (
    <div className="container">
      <Board guesses={guesses} />
      <WordList list={wordlist} wordSelectedHandler={wordSelectedHandler} />
    </div>
  );
});
