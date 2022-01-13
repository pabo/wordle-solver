const {readFile} = require('fs/promises');
const { writeFile } = require('fs/promises');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const tree = require('./trees/wordle.tree.json');
const readline = require('readline')
const util = require('util');
const answerWordlistFile = 'wordlists/wordle_answers.txt';
const guessWordlistFile = 'wordlists/wordle_guesses.txt';
const treeFile = 'trees/wordle.tree.json';

const argv = yargs(hideBin(process.argv)).argv;

const automaticMode = argv.answer || false
const knownAnswer = argv.answer;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = util.promisify(rl.question).bind(rl);

// this is what tree file format looks like
// const tree = {
// 	bestGuess: 'lares',
// 	fitness: 0,
// 	scoreMap: {
// 		'00pl0': {
//			possibleAnswers: ['berme', 'berry', 'berth', 'borne'] //.....
// 			bestGuess: '?',
// 			fitness: '?',
// 		}
// 	}
// };

let pointer = tree;
let fileWritingEnabled = true;
let guessCount = 0;

const go = async () => {
	const guessWords = (await readFile(guessWordlistFile, {encoding: 'utf8'})).split("\n");
	const answerWords = (await readFile(answerWordlistFile, {encoding: 'utf8'})).split("\n");
	const allWords = [...guessWords, ...answerWords];
	const allAnswers = [...answerWords];
	const allGuesses = [...guessWords];

	let words = [...allWords];
	let possibleAnswers = pointer?.possibleAnswers || [...answerWords];

	while (possibleAnswers.length > 1) {
		guessCount++; 

		!automaticMode && console.log(`${possibleAnswers.length} possible answers remain`);
		if (possibleAnswers.length < 200) {
			!automaticMode && console.log(`${possibleAnswers}`);
		}
	
		if (pointer.bestGuess) {
			words = [pointer.bestGuess];
		}
		else {
			words = [...allWords];
		}

		let winningScores;

		// go through every possible guess, pairing with every possible remaining word.
		// for each above combo, score it, and find the next guess with the lowest (winning) fitness
		words.some(possibleGuess => {
			if (possibleGuess) { // TODO: I think this just guards against the newline at the end of the wordlists
				const {fitness, scores} = getFitness(possibleGuess, possibleAnswers);

				if (!pointer.fitness) {
					pointer.fitness = fitness;
					pointer.bestGuess = possibleGuess;
					winningScores = scores;
					!automaticMode && console.log(`winning guess is ${possibleGuess} [${fitness}]`);
				}
				else if (fitness < pointer.fitness || pointer.bestGuess === possibleGuess) {
					winningScores = scores;

					pointer.fitness = fitness;
					pointer.bestGuess = possibleGuess;
					!automaticMode && console.log(`winning guess is ${possibleGuess} [${fitness}]`);
				}
			}

			// uncomment if you want to stop the word list loop early
			// return possibleGuess === 'armed';
		});

		!automaticMode && console.log("\r");

		const actualGuess = automaticMode
			? pointer.bestGuess
			: await promptForInput(`What's your guess? ([enter] for ${pointer.bestGuess}) `) || pointer.bestGuess

		console.log(`guess#${guessCount}: ${actualGuess}`);

		let scoresToUse = winningScores;
		if (actualGuess !== pointer.bestGuess) {
			fileWritingEnabled = false;

			const {fitness, scores} = getFitness(actualGuess, possibleAnswers);
			console.log(`${actualGuess} has a fitness of [${fitness}]`);
			scoresToUse = scores;
		}

		const result = automaticMode
			? scoreGuess(actualGuess, knownAnswer)
			: await promptForInput(`What was the result for ${actualGuess}? `);

			// console.log("result is ", result)
		if (scoresToUse.has(result)) {
			// create this node if necessary
			if (!pointer.scoreMap) {
				pointer.scoreMap = {};
			}

			if (!pointer.scoreMap[result]) {
				pointer.scoreMap[result] = {};
			}

			// descend a node
			pointer = pointer.scoreMap[result];

			possibleAnswers = scoresToUse.get(result);
			pointer.possibleAnswers = possibleAnswers;

			// console.log(JSON.stringify(tree));
			if (fileWritingEnabled) {
				await _writeFile(treeFile, JSON.stringify(tree))
			}
		}
		else {
			throw new Error(`${result} is not a valid score in the format 0/l/p x5`);
		}
	}

	console.log(`guess#${guessCount+1}: ${possibleAnswers[0]} (answer)`);
	process.exit(0)
}

const promptForInput = (text) => {
	return new Promise((resolve, reject) => {
		question(text).then(result => {
			resolve(result);
		}).catch(result => {
			resolve(result);
		});
	});
}

// The fitness is defined as the RMS of the scores. The idea is that, like a binary search splits the search space into 
// 2 equal sub-spaces, here we want to make the guess whose possible results are the best on average. We can't control
// what score we get back from a guess, but we can attempt to generate the best outcome in the average or worst case.
const calculateFitness = function (scoresMap) {
	const numPossibilities = 243;

	const values = Array.from(scoresMap.values());
	const counts = values.map(x => x.length)
	const squares = counts.map(x => x*x);
	const sum = squares.reduce((acum, val) => (acum + val), 0);
      
	const mean = sum/numPossibilities
	return Math.sqrt(mean);
}

// 243 possible scores (3^5)
// 5 positions, 3possibilities
// 	0 (no match)
//	l (letter match)
// 	p (letter and position match)
const scoreGuess = (guess, answer) => {
	const score = ["0", "0", "0", "0", "0"];
      
	if (guess.length !== answer.length) {
	//   throw new Error(`${guess} and ${answer} are different lengths`);
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
	      if (score[i] === '0' && guessList[i] === answerList[j]) {
		score[i] = "l";
		guessList[i] = ".";
		answerList[j] = ".";
		break;
	      }
	    }
	}
	return score.join("");
};

const _writeFile = async (fileName, contents) => {
	try {
		const data = new Uint8Array(Buffer.from(contents));
		const promise = writeFile(fileName, data);

		await promise;
	} catch (err) {
		console.error(err);
	}
}

// given a guess and a word list, generates a fitness value for this guess.
// lower fitnesses should indicate better guesses.
const getFitness = (guess, words) => {
	// scores will be a map of score result => array of possible answers 
	// like 
	// 	00000 => [apple, coats]
	// 	0p0l0 => [fungi]
	// 	ppp00 => [hears, heads, heath]
	const scores = new Map();

	words.forEach(word => {
		const score = scoreGuess(guess, word);

		// uncomment if you want to follow along
		// process.stdout.write(`${guess} vs ${word}, score: ${score}`)

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

go();
