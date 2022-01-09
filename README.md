# wordle solver
Solve the word puzzle at https://powerlanguage.co.uk/wordle/

## Usage

### Normal mode
Help solve the daily wordle. When asked for the result, input a 5 character string where:
- `0` means no match (grey square)
- `l` means letter match (yellow square)
- `p` means position match (green square)

example:
```
$ node index.js
8637 possible answers remain
winning guess is lares [81.25150204372926]

What's your guess? ([enter] for lares) 
guess#1: lares
What was the result for lares? pp00l
guess#2: lasso (answer)
```

### Automatic mode
Given a known answer let the solver automatically guess and show the gameplay.

```
$ node index.js --answer=crank
guess#1: lares
guess#2: brant
guess#3: defog
guess#4: abaca
guess#5: crank (answer)
```


### Testing harness
Run scoring mode for every word in the word list, and save the results to a file.
``` 
$ cat enable5.txt | xargs -n1 -I{} node index.js --answer={} > perf.txt
```

Take the results file and output a summary of how well the solver performs
```
$ cat perf.txt | grep answer | cut -d" " -f1 | sed -e "s/guess#\(.*\):/words took \1 guesses /" | sort | uniq -c
```

## Notes
This was tested on node `v14.10.0`. I think `v16` breaks it but haven't looked into why.

The author of wordle stated that he started with a wordlist of every 5 letter word, and then pared it down to "common words". Despite this, I still use the entire set of known 5-letter words from the commonly-used ENABLE wordlist. I [include those word lists here](./wordlists/), as well as several variations.
