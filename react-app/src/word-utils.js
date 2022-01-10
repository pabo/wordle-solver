// given a guess and a word list, generates a fitness value for this guess.
// lower fitnesses should indicate better guesses.
export const getFitness = (guess, words) => {
	// scores will be a map of score result => array of possible answers 
	// like 
	// 	00000 => [apple, coats]
	// 	0p0l0 => [fungi]
	// 	ppp00 => [hears, heads, heath]
	const scores = new Map();

	words.forEach(word => {
		const score = scoreGuess(guess, word);

		if (scores.has(score)) {
			scores.set(score, [...scores.get(score), word]);
		}
		else {
			scores.set(score, [word]);
		}
	})

	return {
		fitness: calculateFitness(scores),
		scores
	};
}

// The fitness is defined as the RMS of the scores. The idea is that, like a binary search splits the search space into 
// 2 equal sub-spaces, here we want to make the guess whose possible results are the best on average. We can't control
// what score we get back from a guess, but we can attempt to generate the best outcome in the average or worst case.
const calculateFitness = function (scoresMap) {
	const numPossibilities = 243;

	const values = Array.from(scoresMap.values());
	const counts = values.map(x => x.length)
	const squares = counts.map(x => x*x);
	const sum = squares.reduce((acum, val) => (acum + val));
      
	const mean = sum/numPossibilities
	return Math.sqrt(mean);
}

// 243 possible scores (3^5)
// 5 positions, 3possibilities
// 	0 (no match)
//	l (letter match)
// 	p (letter and position match)
const scoreGuess = (guess, answer) => {
	const score = [0,0,0,0,0];

	guess.split("").forEach((guessChar, guessIndex) => {
		if (guessChar === answer[guessIndex]) {
			score[guessIndex] = "p";
		}
		else if (answer.includes(guessChar)) { // TODO: could double count double letters?
			score[guessIndex] = "l";
		}
	})	

	return score.join("");
}
