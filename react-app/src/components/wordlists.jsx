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
        {word} ({score.fitness.toFixed(3)})
      </div>
    );
  }
);

const CandidateListWord = observer(({ word }) => {
  return (
    <div className="candidate-word" data-word={word}>
      {word}
    </div>
  );
});


export const GuessList = observer(
  ({ words = [], wordSelectedHandler, candidateWords }) => {
    return (
      <div className="guess-list">
        <div className="header">Legal guesses, sorted by fitness</div>
        <div className="wordlist">
          {words.map(([word, score]) => {
            const isCandidate = candidateWords.has(word);

            return (
              <GuessListWord
                isCandidate={isCandidate}
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
  }
);

export const CandidateList = observer(({ words = [] }) => {
  return (
    <div className="candidate-list">
      <div className="header">{words.size} possible answers</div>
      <div className="wordlist">
        {[...words].map((word) => (
          <CandidateListWord key={word} word={word} />
        ))}
      </div>
    </div>
  );
});
