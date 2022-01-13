// import { list } from "./enable5.js";
import { list as answerList } from "./wordle-answers";
import { list as guessList } from "./wordle-guesses";
import { runInAction, observable, makeAutoObservable } from "mobx";
import { getFitness } from "./word-utils";

export class Store {
  constructor() {
    this.fitnessWorker = new Worker("word-utils-worker.js");
    this.survivorWorker = new Worker("word-utils-worker.js");

    this.progress = 100; // TODO: progress?
    this.guesses = [];

    this.guessFitnessMap = observable.map();
    this.guessSurvivorMapMap = observable.map();

    this.isLoadingFitness = false;
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
    // TODO: 2. GUESS: if this letter has been guessed in another position and resulted in a 'p',
    // then we can se it to 'l'
    // 3. default to 0
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

  // survivors, given all current info like soft evaluation
  get currentSurvivors() {
    return this.filteredPossibleAnswers;
  }

  // TODO: for soft culling, we filter based on the last results from calculateGuessesAndScores,
  //  which now happens with every toggle. is this an issue?
  get filteredPossibleAnswers() {
    if (!this.lastGuess) {
      return this.possibleAnswers;
    }

    const survivors = this.guessSurvivorMapMap
      .get(this.lastGuessedWord)
      .get(this.lastGuessedEvaluation.join(""));

    return new Set(survivors);
  }

  updateGuessFitnessMap() {
    this.fitnessWorker.postMessage({mode: "fitness", wordsToScore: [...this.possibleGuesses], wordsToScoreAgainst: [...this.currentSurvivors]});
      // [...this.possibleGuesses].forEach((word, index) => {
      //   const { fitness } = getFitness(word, [...this.currentSurvivors]);

      //   this.guessFitnessMap.set(word, fitness);
      // });
      this.fitnessWorker.onmessage = message => {
        const { data: {mode, results}} = message;

        if (mode === 'fitness') {
          console.log(`got back results from ${mode}`, results);

          runInAction(() => {
            this.guessFitnessMap = observable.map(results)
          })
        }
      }
  }

  updateGuessSurvivorMapMap() {
    this.survivorWorker.postMessage({mode: "survivors", wordsToScore: [...this.possibleGuesses], wordsToScoreAgainst: [...this.possibleAnswers]});
      this.survivorWorker.onmessage = message => {
        const { data: {mode, results}} = message;

        if (mode === 'survivors') {
          console.log(`got back results from ${mode}`, results);

          runInAction(() => {
            this.guessSurvivorMapMap = observable.map(results)
          })
        }
      }
  }

  // the surviving possible guesses, scored and sorted
  get sortedGuessesAndScores() {
    console.log("sorting guesses and scores");
    return [...this.guessFitnessMap.entries()]
      .sort((a, b) => a[1] - b[1])
      .filter(([guess]) => !this.guesses.some(({ word }) => guess === word));
  }
}
