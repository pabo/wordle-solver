import { observer } from "mobx-react-lite";

const GuessListWord = observer(
  ({ word, score, wordSelectedHandler = () => {}, isCandidate }) => {
    const handleClick = (e) => {
      wordSelectedHandler(e.target.dataset.word);
    };

    return (
      <div
        className={`guess-list-word ${isCandidate ? "candidate" : ""}`}
        data-word={word}
        onClick={handleClick}
      >
        {word} ({score.toFixed(3)})
      </div>
    );
  }
);

const CandidateListWord = observer(({ word, wordSelectedHandler }) => {
  const handleClick = (e) => {
    wordSelectedHandler(e.target.dataset.word);
  };

  return (
    <div className="candidate-word" data-word={word} onClick={handleClick}>
      {word}
    </div>
  );
});

export const GuessList = observer(({ words = [], wordSelectedHandler }) => {
  return (
    <div className="guess-list">
      <div className="header">Legal guesses, sorted by fitness</div>
      <div className="wordlist">
        {words.map(([word, score]) => {
          return (
            <GuessListWord
              key={word}
              word={word}
              score={score}
              wordSelectedHandler={wordSelectedHandler}
            />
          );
        })}
      </div>
    </div>
  );
});

export const CandidateList = observer(({ words = [], wordSelectedHandler }) => {
  return (
    <div className="candidate-list">
      <div className="header">{words.size} possible answers</div>
      <div className="wordlist">
        {[...words].map((word) => (
          <CandidateListWord
            key={word}
            word={word}
            wordSelectedHandler={wordSelectedHandler}
          />
        ))}
      </div>
    </div>
  );
});
