const {readFile} = require('fs/promises');
const { writeFile } = require('fs/promises');
const tree = require('./wordle.tree.json');
const readline = require('readline')
const util = require('util');
const wordlistFile = 'enable5.txt';
const treeFile = 'wordle.tree.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = util.promisify(rl.question).bind(rl);

// this is what tree file format looks like
// const tree = {
// 	bestGuess: 'lares',
// 	rms: 0,
// 	scoreMap: {
// 		'00pl0': {
//			possibleAnswers: ['berme', 'berry', 'berth', 'borne'] //.....
// 			bestGuess: '?',
// 			rms: '?',
// 		}
// 	}
// };

let pointer = tree;
let fileWritingEnabled = true;

const go = async () => {
	const allWords = (await readFile(wordlistFile, {encoding: 'utf8'})).split("\n");
	let words = [...allWords];
	let possibleAnswers = pointer?.possibleAnswers || [...words];

	while (possibleAnswers.length > 1) {
		console.log(`${possibleAnswers.length} possible answers remain`);
		if (possibleAnswers.length < 200) {
			console.log(`${possibleAnswers}`);
		}
	
		if (pointer.bestGuess) {
			words = [pointer.bestGuess];
		}
		else {
			words = [...allWords];
		}

		let winningScores;

		// go through every possible guess, pairing with every possible remaining word.
		// for each above combo, score it, then find the guess with the best spread (that will
		// yield the most possible information on average) measured by RMS.
		words.some(possibleGuess => {
			const {rms, scores} = getFitness(possibleGuess, possibleAnswers);

			if (!pointer.rms) {
				pointer.rms = rms;
				winningScores = scores;
				console.log(`winning guess is ${possibleGuess} [${rms}]`);
			}
			else if (rms < pointer.rms || pointer.bestGuess === possibleGuess) {
				winningScores = scores;

				pointer.rms = rms;
				pointer.bestGuess = possibleGuess;
				console.log(`winning guess is ${possibleGuess} [${rms}]`);
			}

			// uncomment if you want to stop the word list loop early
			// return possibleGuess === 'armed';
		});

		console.log("\r");

		const actualGuess = await promptForInput(`What's your guess? ([enter] for ${pointer.bestGuess}) `) || pointer.bestGuess;

		let scoresToUse = winningScores;
		if (actualGuess !== pointer.bestGuess) {
			fileWritingEnabled = false;

			const {rms, scores} = getFitness(actualGuess, possibleAnswers);
			console.log(`${actualGuess} has a fitness of [${rms}]`);
			scoresToUse = scores;
		}

		const result = await promptForInput(`What was the result for ${actualGuess}? `);
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

	console.log("answer is", possibleAnswers[0]);
	process.exit(0)
}

const promptForInput = (text) => {
	return new Promise((resolve, reject) => {
		question(text).then(e => {
			// lol wtf this is the failure case
			resolve(undefined);
		}).catch(result => {
			// lol wtf this is the success case
			resolve(result);
		});
	});
}

const calculateRMS = function (scoresMap) {
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

const _writeFile = async (fileName, contents) => {
	try {
		const data = new Uint8Array(Buffer.from(contents));
		const promise = writeFile(fileName, data);

		await promise;
	} catch (err) {
		console.error(err);
	}
}

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
		// process.stdout.write(`\r${possibleGuess} vs ${possibleAnswer}, score: ${score}`)

		if (scores.has(score)) {
			scores.set(score, [...scores.get(score), word]);
		}
		else {
			scores.set(score, [word]);
		}
	})

	return {
		rms: calculateRMS(scores),
		scores
	};
}

go();
