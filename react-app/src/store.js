import { list } from "./enable5.js";
import { observable, makeAutoObservable } from "mobx";
import { getFitness } from "./word-utils";
export class Store {
  constructor() {
    // as we gain information, this map will be culled down to eventually one possible word
    this.candidateWordsCulled = observable.set(new Set(list));

    // All words all allowed as guesses except those that have already been guessed.
    // otherwise the only thing that changes is the score associated with each guess word
    this.nextGuessMap = observable.map(
      new Map(list.map((word) => [word, { fitness: 0 }]))
    );

    // The guesses that have been made, {guess: "abide", evaluation: []}
    this.madeGuesses = [];
    this.calculateGuessScores();

    this.knownPositions = [null, null, null, null, null];

    makeAutoObservable(this);
  }

  addGuess = (guess) => {
    this.updateKnownPositions();
    this.hardCullCandidateWords();
    this.calculateGuessScores();
    this.madeGuesses.push({ guess, evaluation: ["0", "0", "0", "0", "0"] });
  };

  updateKnownPositions = () => {
	  if (this.lastMadeGuess) {

	this.lastMadeGuess.evaluation.forEach((letter, index) => {
		if (letter === 'p') {
			this.knownPositions[index] = this.lastMadeGuess.guess.split("")[index];
		}
	})
	  console.log("updating known pos", this.knownPositions)
	  }
  }

  // we'd like to only ever toggle the most recent guess
  toggleLetterScore = (position) => {
    const oldEvaluation = this.lastMadeGuess.evaluation;
    const newEvaluation = [...oldEvaluation];

    if (oldEvaluation[position] === "l") {
      newEvaluation[position] = "p";
    } else if (oldEvaluation[position] === "p") {
      newEvaluation[position] = "0";
    } else if (oldEvaluation[position] === "0") {
      newEvaluation[position] = "l";
    } else if (oldEvaluation[position] === "x") {
      newEvaluation[position] = "l";
    }

    this.madeGuesses[this.madeGuesses.length - 1] = {
      ...this.lastMadeGuess,
      evaluation: newEvaluation,
    };
  };

  // TODO: don't always want to cull.
  // should only cull when a score has been locked in (which is when the next guess is recorded)
  // meanwhile the possible answers AND the guess scores should be calculated for display
  hardCullCandidateWords = () => {
	  console.log("culling candidateWords")
    if (!this.lastMadeGuess) {
      return this.candidateWordsCulled;
    }
    const scoreToApply = this.lastMadeGuess.evaluation.join("");

    const { scoresSurvivorsMap } = this.nextGuessMap.get(
      this.lastMadeGuess.guess
    );

    const survivors = scoresSurvivorsMap.get(scoreToApply);

    this.candidateWordsCulled = observable.set(new Set(survivors));
  };

  get candidateWords() {
	  console.log("getting candidateWords")
    if (!this.lastMadeGuess) {
      return this.candidateWordsCulled;
    }
    const scoreToApply = this.lastMadeGuess.evaluation.join("");

    const { scoresSurvivorsMap } = this.nextGuessMap.get(
      this.lastMadeGuess.guess
    );

    const survivors = scoresSurvivorsMap.get(scoreToApply);

    return observable.set(new Set(survivors));
  }

  // needed?
  get lastMadeGuess() {
    return this.madeGuesses[this.madeGuesses.length - 1];
  }

  get candidateWordsList() {
    return Array.from(this.candidateWords.keys());
  }

  calculateGuessScores = () => {
	  console.log("calcing guess scores");
    [...this.nextGuessMap].forEach(([word]) => {
      const results = getFitness(word, this.candidateWordsList);
      this.nextGuessMap.set(word, results);
    });
  };

  get sortedGuessesAndScores() {
    return Array.from(this.nextGuessMap.entries())
      .sort((a, b) => a[1].fitness - b[1].fitness)
      .filter(
        ([word]) => !this.madeGuesses.some(({ guess }) => guess === word)
      );
  }
}
