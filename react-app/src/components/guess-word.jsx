import { LetterTile } from "./letter-tile";
import { observer } from "mobx-react-lite";

export const GuessWord = observer(
  ({ word, score = [], toggleLetterScore, knownAnswer }) => {
    let displayWord = word;
    if (knownAnswer) {
      displayWord = knownAnswer;
    }

    return (
      <div className="guess-word">
        {displayWord ? (
          displayWord.split("").map((letter, index) => {
            const evaluation = score[index];
            return (
              <LetterTile
                key={index}
                letter={letter}
                evaluation={knownAnswer ? "known" : evaluation}
                toggleLetter={({ forward }) => {
                  toggleLetterScore(index, forward);
                }}
              />
            );
          })
        ) : (
          <>
            <LetterTile key="1" evaluation="pending" />
            <LetterTile key="2" evaluation="pending" />
            <LetterTile key="3" evaluation="pending" />
            <LetterTile key="4" evaluation="pending" />
            <LetterTile key="5" evaluation="pending" />
          </>
        )}
      </div>
    );
  }
);
