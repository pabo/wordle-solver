export const LetterTile = ({ letter, evaluation = "", toggleLetter }) => {
  const handleToggle = (e) => {
    e.preventDefault();
    const forward = e.button === 0;
    toggleLetter({ forward });
  };

  return (
    <div
      className={`letter-tile ${evaluation}`}
      onClick={handleToggle}
      onContextMenu={handleToggle}
    >
      {letter}
    </div>
  );
};
