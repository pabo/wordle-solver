import { list } from "./enable5.js";
import { action, computed, observable, makeObservable, makeAutoObservable } from "mobx";
import { getFitness } from './word-utils';
export class Store {
  constructor() {
    this.candidateWords = observable.map(new Map(list.map(word => [word, 0])));
    this.guessMap = observable.map();

    makeAutoObservable(this);
  }

  addGuess = (guess) => {
	this.guessMap.set(guess, ["0","0","0","0","0"]);
  };

  toggleLetterScore = (guess, position) => {
	const oldEvaluation = this.guessMap.get(guess);
	const newEvaluation = [...oldEvaluation];

	if (oldEvaluation[position] === "l") {
		newEvaluation[position] = "p";
	}
	else if (oldEvaluation[position] === "p") {
		newEvaluation[position] = "0";
	}
	else if (oldEvaluation[position] === "0") {
		newEvaluation[position] = "l";
	}

	console.log("new eval", newEvaluation)

	this.guessMap.set(guess, newEvaluation);

	// recalculateScores();
  }

  calculateWordScores = () => {
	this.candidateWordlist.forEach(word => {
		const {fitness, scores} = getFitness(word, this.candidateWordlist);
		console.log(fitness, scores);
	});
  }

  get guessList() {
	return Array.from(this.guessMap.keys());
  }

  get candidateWordlist() {
	return Array.from(this.candidateWords.keys());
  }
}
