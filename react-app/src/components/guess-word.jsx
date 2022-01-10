import { LetterTile } from './letter-tile';

export const GuessWord = ({word}) => {
	return <div className="guess-word">
		{ word
		? word.split("").map((letter, index) => <LetterTile key={index} letter={letter}/>)
		: <>
			<LetterTile key="1" evaluation="pending" />
			<LetterTile key="2" evaluation="pending" />
			<LetterTile key="3" evaluation="pending" />
			<LetterTile key="4" evaluation="pending" />
			<LetterTile key="5" evaluation="pending" />
		</>
		}
	</div>
}
