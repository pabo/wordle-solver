import { observer } from "mobx-react-lite";

const GuessListWord = observer(
  ({ word, score, wordSelectedHandler = () => {}, isCandidate}) => {
    const handleClick = (e) => {
      wordSelectedHandler(e.target.dataset.word);
    };

    return (
      <div className={`guess-list-word ${isCandidate ? 'candidate' : ''}`} data-word={word} onClick={handleClick}>
        {word} ({score.fitness})
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

export const GuessList = observer(({ words = [], wordSelectedHandler, candidateWords }) => {
  return (
    <div className="guess-list">
      <div className="header">Possible guesses (count: {words.length})</div>
      <div className="wordlist">
        {words.map(([word, score]) => {
          const isCandidate = candidateWords.has(word);

          return <GuessListWord
            isCandidate={isCandidate}
            key={word}
            word={word}
            score={score}
            wordSelectedHandler={wordSelectedHandler}
          />;
        })}
      </div>
    </div>
  );
});

export const CandidateList = observer(({ words = [] }) => {
  return (
    <div className="candidate-list">
      <div className="header">Candidate words (count: {words.size})</div>
      <div className="wordlist">
        {[...words].map((word) => (
          <CandidateListWord key={word} word={word} />
        ))}
      </div>
    </div>
  );
});
