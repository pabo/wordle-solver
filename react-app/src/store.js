import { list } from "./enable5.js";
import { makeAutoObservable } from "mobx";

export class Store {
  guesses = [];
  wodlist = [];

  constructor() {
    console.log("consrtuctor running");
    this.guesses = ["lares", "quick"];
    this.wordlist = list;

    makeAutoObservable(this);
  }

  addGuess = (guess) => {
    this.guesses = [...this.guesses, guess];
  };
}
