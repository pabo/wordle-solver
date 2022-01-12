// import { useState } from "react";

export const LetterTile = ({ letter, evaluation = "", toggleLetter }) => {
  // const [explicitlySet, setExplicitlySet] = useState(false);

  const handleToggle = () => {
    // setExplicitlySet(true);
    toggleLetter();
  };

  return (
    <div
      // className={`letter-tile ${evaluation} ${explicitlySet ? "" : "initial"}`}
      className={`letter-tile ${evaluation}`}
      onClick={handleToggle}
    >
      {letter}
    </div>
  );
};
