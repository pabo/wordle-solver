const scoreGuess = (guess, answer) => {
	const score = ["0", "0", "0", "0", "0"];
      
	if (guess.length !== answer.length) {
	//   throw new Error(`${guess} and ${answer} are different lengths`);
	}
      
	const guessList = guess.split("");
	const answerList = answer.split("");
      
	for (let i = 0; i < guessList.length; i++) {
		console.log(`testing ${guessList[i]} vs ${answerList[i]}`)
	  if (guessList[i] === answerList[i]) {
		      console.log("match!!!!")
	    score[i] = "p";
	    guessList[i] = ".";
	    answerList[i] = ".";
	  }
	}
      
	for (let i = 0; i < guessList.length; i++) {
	    for (let j = 0; j < guessList.length; j++) {
		console.log(`testing ${guessList[i]} vs ${answerList[j]}`)
	      if (score[i] === '0' && guessList[i] === answerList[j]) {
		      console.log("match!!!!")
		score[i] = "l";
		guessList[i] = ".";
		answerList[j] = ".";
		break;
	      }
	    }
	}
	return score.join("");
};

console.log(scoreGuess("query", "rates"));
console.log(scoreGuess("rates", "query"));
