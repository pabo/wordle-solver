// import { list } from "./enable5.js";
import { list as answerList } from "./wordle-answers";
import { list as guessList } from "./wordle-guesses";
import { runInAction, observable, makeAutoObservable } from "mobx";

export class Store {
  constructor() {
    this.guesses = [];

    this.fitnessWorker = new Worker("word-utils-worker.js");
    this.survivorWorker = new Worker("word-utils-worker.js");

    this.guessFitnessMap = observable.map();
    this.guessSurvivorMapMap = observable.map();

    this.outstandingLoadingWorkers = 0;
    this.isLoadingSurvivorMap = false;

    this.possibleGuesses = observable.set();
    // this.guessSurvivorMapMap = observable.map();

    [...answerList, ...guessList].forEach((word) => {
      this.possibleGuesses.add(word);
    });

    this.possibleAnswers = observable.set(new Set(answerList));

    this.updateGuessFitnessMap();
    this.updateGuessSurvivorMapMap();

    makeAutoObservable(this);
  }

  // by adding a guess we are essentially locking in the previous guess
  // as well as starting the next guess
  addGuess = (guess) => {
    // lock in previous guess and evaluation
    this.cullPossibleAnswers();

    // add guess as a still-fluid guess
    this.guesses.push({
      word: guess,
      evaluation: this.evaluateGuess(guess),
    });

    this.updateGuessFitnessMap();
    this.updateGuessSurvivorMapMap();
  };

  // we'd like to only ever toggle the most recent guess
  toggleLetterScore = (position, forward) => {
    const oldEvaluation = this.lastGuess.evaluation;
    const newEvaluation = [...oldEvaluation];

    if (oldEvaluation[position] === "l") {
      newEvaluation[position] = forward ? "p" : "0";
    } else if (oldEvaluation[position] === "p") {
      newEvaluation[position] = forward ? "0" : "l";
    } else if (oldEvaluation[position] === "0") {
      newEvaluation[position] = forward ? "l" : "p";
    }

    this.guesses[this.guesses.length - 1] = {
      ...this.lastGuess,
      evaluation: newEvaluation,
    };

    this.updateGuessFitnessMap();
  };

  // This is simply for convenience. We can know some of them, and we can guess at the rest.
  evaluateGuess = (guess) => {
    // 1. KNOWN: if this letter has been guessed in this position before, then re-use the
    // evaluation.
    // 2. GUESS: if this letter has been guessed in another position and resulted in a 'p' or 'l',
    // then we can set it to 'l'
    // 3. default to 0
    const guessLetters = guess.split("");
    let evaluationResult = ["0", "0", "0", "0", "0"];

    guessLetters.forEach((guessLetter, index) => {
      this.guesses.forEach(({ word, evaluation }) => {
        // 1. KNOWN
        if (word.charAt(index) === guessLetter) {
          evaluationResult[index] = evaluation[index];
          return true;
        }

        // 2. GUESS
        const foundIndex = word.indexOf(guessLetter);
        if (
          foundIndex !== -1 &&
          evaluation[foundIndex] !== "0" &&
          evaluationResult[index] !== "p"
        ) {
          evaluationResult[index] = "l";
        }
      });
    });

    return evaluationResult;
  };

  get lastGuess() {
    return this.guesses[this.guesses.length - 1];
  }

  get lastGuessedWord() {
    return this.lastGuess?.word;
  }

  get lastGuessedEvaluation() {
    return this.lastGuess?.evaluation;
  }

  cullPossibleAnswers = () => {
    const newPossibleAnswers = this.currentSurvivors;
    [...this.possibleAnswers.keys()].forEach((key) => {
      if (!newPossibleAnswers.has(key)) {
        this.possibleAnswers.delete(key);
      }
    });
  };

  // TODO: for soft culling, we filter based on the last results from calculateGuessesAndScores,
  //  which now happens with every toggle. is this an issue?
  get currentSurvivors() {
    if (!this.lastGuess) {
      return this.possibleAnswers;
    }

    const survivors = this.guessSurvivorMapMap
      .get(this.lastGuessedWord)
      .get(this.lastGuessedEvaluation.join(""));

    return new Set(survivors);
  }

  get knownAnswer() {
    if (this.currentSurvivors.size === 1) {
      return [...this.currentSurvivors][0];
    }

    return "";
  }

  get isLoadingFitness() {
    return this.outstandingLoadingWorkers > 0;
  }

  updateGuessFitnessMap() {
    this.outstandingLoadingWorkers++;

    this.fitnessWorker.onmessage = (message) => {
      const {
        data: { results },
      } = message;

      console.log(`got back results from fitness`, results);

      runInAction(() => {
        this.guessFitnessMap = observable.map(results);
        this.outstandingLoadingWorkers--;
      });
    };

    this.fitnessWorker.postMessage({
      mode: "fitness",
      wordsToScore: [...this.possibleGuesses],
      wordsToScoreAgainst: [...this.currentSurvivors],
    });
  }

  updateGuessSurvivorMapMap() {
    this.survivorWorker.onmessage = (message) => {
      const {
        data: { results },
      } = message;

      console.log(`got back results from survivors`, results);

      runInAction(() => {
        this.guessSurvivorMapMap = observable.map(results);
      });
    };

    this.survivorWorker.postMessage({
      mode: "survivor",
      wordsToScore: [...this.possibleGuesses],
      wordsToScoreAgainst: [...this.possibleAnswers],
    });
  }

  // the surviving possible guesses, scored and sorted
  get sortedGuessesAndScores() {
    console.log("sorting guesses and scores");
    return [...this.guessFitnessMap.entries()]
      .sort((a, b) => a[1] - b[1])
      .filter(([guess]) => !this.guesses.some(({ word }) => guess === word));
  }
}
