let cache = new Map();

let cacheHits = 0;
let cacheMisses = 0;

// cache keys:
// just append all the words together
// assumes sort is the same
// assumes it all fits in a key (~2**27 ish)
// room for improvement here lol

onmessage = (message) => {
	const { data: {mode, wordsToScore, wordsToScoreAgainst } } = message;

	console.log(`starting worker for mode ${mode}`);

	const results = new Map();
	const joinedWordList = wordsToScoreAgainst.join("");
	wordsToScore.forEach(word => {
		const key = `${word}|${joinedWordList}`;

		let result;

		if (cache.has(key)) {
			cacheHits++;
			result = cache.get(key);
		}
		else {
			cacheMisses++;
			result = getFitness(word, wordsToScoreAgainst); 
			cache.set(key, result);
		}

		const { fitness, scoresSurvivorsMap } = result;

		if (mode === 'fitness') {
			results.set(word, fitness);
		}
		else {
			results.set(word, scoresSurvivorsMap);
		}
	});

	console.log(`ending worker for mode ${mode} with ${cacheHits}/${cacheHits+cacheMisses} cache hits (${cacheHits/(cacheHits + cacheMisses)})`);
	postMessage({mode, results});
}

// given a guess and a word list, generates a fitness value for this guess.
// lower fitnesses should indicate better guesses.
const getFitness = (guess, words) => {
	// scores will be a map of score result => array of possible answers
	// like
	// 	00000 => [apple, coats]
	// 	0p0l0 => [fungi]
	// 	ppp00 => [hears, heads, heath]
	const scoresSurvivorsMap = new Map();
      
	words.forEach((word) => {
	  const score = scoreGuess(guess, word);
      
	  if (scoresSurvivorsMap.has(score)) {
	    scoresSurvivorsMap.set(score, [...scoresSurvivorsMap.get(score), word]);
	  } else {
	    scoresSurvivorsMap.set(score, [word]);
	  }
	});
      
	return {
	  fitness: calculateFitness(scoresSurvivorsMap),
	  scoresSurvivorsMap,
	};
      };
      
      // The fitness is defined as the RMS of the scores. The idea is that, like a binary search splits the search space into
      // 2 equal sub-spaces, here we want to make the guess whose possible results are the best on average. We can't control
      // what score we get back from a guess, but we can attempt to generate the best outcome in the average or worst case.
      const calculateFitness = function (scoresMap) {
	const numPossibilities = 243;
      
	const values = Array.from(scoresMap.values());
	const counts = values.map((x) => x.length);
	const squares = counts.map((x) => x * x);
	const sum = squares.reduce((acum, val) => acum + val, 0);
      
	const mean = sum / numPossibilities;
	return Math.sqrt(mean);
      };
      
      // 243 possible scores (3^5)
      // 5 positions, 3possibilities
      // 	0 (no match)
      //	l (letter match)
      // 	p (letter and position match)
      const scoreGuess = (guess, answer) => {
	const score = ["0", "0", "0", "0", "0"];
      
	if (guess.length !== answer.length) {
	  throw new Error("guess and answer are different lengths");
	}
      
	const guessList = guess.split("");
	const answerList = answer.split("");
      
	for (let i = 0; i < guessList.length; i++) {
	  if (guessList[i] === answerList[i]) {
	    score[i] = "p";
	    guessList[i] = ".";
	    answerList[i] = ".";
	  }
	}
      
	for (let i = 0; i < guessList.length; i++) {
	  for (let j = 0; j < guessList.length; j++) {
	    if (score[i] === "0" && guessList[i] === answerList[j]) {
	      score[i] = "l";
	      guessList[i] = ".";
	      answerList[j] = ".";
	      break;
	    }
	  }
	}
	return score.join("");
      };
      