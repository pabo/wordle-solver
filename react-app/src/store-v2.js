// import { list } from "./enable5.js";
import { list as answerList } from "./wordle-answers";
import { list as guessList } from "./wordle-guesses";
import { observable, makeAutoObservable } from "mobx";
import { getFitness } from "./word-utils";

export class Store {
  constructor() {
    this.guesses = [];
    this.possibleGuesses = observable.map(
      new Map(
        [...answerList, ...guessList].map((word) => [word, { fitness: 0 }])
      )
    );
    this.scoresSurvivorsMap = observable.map();
    this.possibleAnswers = observable.set(new Set(answerList));

    this.calculateGuessesAndScores();

    makeAutoObservable(this);
  }

  // by adding a guess we are essentially locking in the previous guess as well
  // as starting the next guess
  addGuess = (guess) => {
    // lock in previous guess and evaluation
    this.cullPossibleAnswers();
    this.calculateGuessesAndScores(); // TODO: is this done anyways by some side effect?

    // add guess as a still-fluid guess
    this.guesses.push({
      word: guess,
      evaluation: this.evaluateGuess(guess),
    });
  };

  // we'd like to only ever toggle the most recent guess
  toggleLetterScore = (position) => {
    const oldEvaluation = this.lastGuess.evaluation;
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

    this.guesses[this.guesses.length - 1] = {
      ...this.lastGuess,
      evaluation: newEvaluation,
    };

    // either soft-cull both lists or rely on computeds....
  };

  // This is simply for convenience. We can know some of them, and we can guess at the rest.
  evaluateGuess = (guess) => {
    // 1. KNOWN: if this letter has been guessed in this position before, then re-use the
    // evaluation.
    // TODO: 2. GUESS: if this letter has been guessed in another position and resulted in a 'p',
    // then we can se it to 'l'
    const guessLetters = guess.split("");
    let evaluation = ["0", "0", "0", "0", "0"];

    this.guesses.forEach(
      ({ word: previousWord, evaluation: previousEvaluation }) => {
        previousWord.split("").forEach((previousWordLetter, index) => {
          if (previousWordLetter === guessLetters[index]) {
            // case 1 above
            evaluation[index] = previousEvaluation[index];
          }
        });
      }
    );

    return evaluation;
  };

  cullPossibleAnswers = () => {
    console.log("hard cull answers");
    this.possibleAnswers = this.filteredPossibleAnswers;
  };

  get currentSurvivors() {
    console.log("soft cull answers");
    return this.filteredPossibleAnswers;
  }

  calculateGuessesAndScores = () => {
    console.log("calculating scores");
    [...this.possibleGuesses].forEach(([word]) => {
      console.log("scoring", word);
      // get the fitness and survivormap of each word
      const results = getFitness(word, [...this.possibleAnswers]);
      this.possibleGuesses.set(word, results);
    });
  };

  get lastGuess() {
    return this.guesses[this.guesses.length - 1];
  }

  get lastGuessedWord() {
    return this.lastGuess.word;
  }

  get lastGuessedEvaluation() {
    return this.lastGuess.evaluation;
  }

  get filteredPossibleAnswers() {
    if (!this.lastGuess) {
      return this.possibleAnswers;
    }

    const { scoresSurvivorsMap } = this.possibleGuesses.get(
      this.lastGuessedWord
    );
    const survivors = scoresSurvivorsMap.get(
      this.lastGuessedEvaluation.join("")
    );
    return observable.set(new Set(survivors));
  }

  // the surviving possible guesses, scored and sorted
  get sortedGuessesAndScores() {
    return [...this.possibleGuesses.entries()]
      .sort((a, b) => a[1].fitness - b[1].fitness)
      .filter(([guess]) => !this.guesses.some(({ word }) => guess === word));
  }
}
