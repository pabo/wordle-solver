import { list } from "./enable5.js";
import { observable, makeAutoObservable } from "mobx";
import { getFitness } from "./word-utils";
export class Store {
  constructor() {
    // as we gain information, this map will be culled down to eventually one possible word
    this.candidateWords = observable.set(new Set(list));

    // All words all allowed as guesses, therefor this map will always have all words.
    // what changes is the score associated with each guess word
    this.nextGuessMap = observable.map(
      new Map(list.map((word) => [word, { fitness: 0 }]))
    );

    // The guesses that have been made, {guess: "abide", evaluation: []}
    this.madeGuesses = [];

    makeAutoObservable(this);
  }

  addGuess = (guess) => {
    this.madeGuesses.push({ guess, evaluation: ["0", "0", "0", "0", "0"] });
    this.calculateGuessScores();
  };

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
    }

    this.madeGuesses[this.madeGuesses.length - 1] = {
      ...this.lastMadeGuess,
      evaluation: newEvaluation,
    };

    this.cullCandidateWords();
  };

  cullCandidateWords = () => {
    const scoreToApply = this.lastMadeGuess.evaluation.join("");

    const { scoresSurvivorsMap } = this.nextGuessMap.get(
      this.lastMadeGuess.guess
    );

    const survivors = scoresSurvivorsMap.get(scoreToApply);

    this.candidateWords = observable.set(new Set(survivors));
  };

  // needed?
  get lastMadeGuess() {
    return this.madeGuesses[this.madeGuesses.length - 1];
  }

  calculateGuessScores = () => {
    [...this.nextGuessMap].forEach(([word]) => {
      const results = getFitness(word, this.candidateWordsList);
      this.nextGuessMap.set(word, results);
    });
  };

  get candidateWordsList() {
    return Array.from(this.candidateWords.keys());
  }

  get sortedGuessesAndScores() {
    return Array.from(this.nextGuessMap.entries()).sort(
      (a, b) => a[1].fitness - b[1].fitness
    );
  }
}
