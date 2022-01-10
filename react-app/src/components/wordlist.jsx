const CandidateWord = ({ word, wordSelectedHandler }) => {
  const handleClick = (e) => {
    wordSelectedHandler(e.target.dataset.word);
  };

  return (
    <div className="candidate-word" data-word={word} onClick={handleClick}>
      {word}
    </div>
  );
};

export const WordList = ({ list, wordSelectedHandler }) => {
  return (
    <div className="wordlist">
      <div className="remaining-count">
        Candidate words remaining; {list.length}
      </div>
      <div className="candidate-words">
        {list.map((word, index) => (
          <CandidateWord
            key={index}
            word={word}
            wordSelectedHandler={wordSelectedHandler}
          />
        ))}
      </div>
    </div>
  );
};
