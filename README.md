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
$ node index.js                                                                                                                master
2316 possible answers remain
winning guess is roate [24.026220244958616]

What's your guess? ([enter] for roate) 
guess#1: roate
What was the result for roate? lll0l
guess#2: opera (answer)
```

Note that you can override the suggested guess any time you want:
```
$ node index.js                                                                                                                master
2316 possible answers remain
winning guess is roate [24.026220244958616]

What's your guess? ([enter] for roate) other
guess#1: other
other has a fitness of [33.13471691474934]
What was the result for other? p0000
6 possible answers remain
oddly,offal,onion,opium,ovoid,owing
winning guess is aband [0.15713484026367722]

What's your guess? ([enter] for aband) aband
guess#2: aband
What was the result for aband? 000p0
guess#3: owing (answer)
```

### Automatic mode
Given a known answer let the solver automatically guess and show the gameplay.

```
$ node index.js --answer=puppy                                                                                                 master
guess#1: roate
guess#2: slimy
guess#3: phang
guess#4: abaft
guess#5: puppy (answer)

```

### Testing harness
Run scoring mode for every word in the word list, and save the results to a file.
``` 
$ cat enable5.txt | xargs -n1 -I{} node index.js --answer={} > perf.txt
```

Take the results file and output a summary of how well the solver performs
```
$ cat perf.txt | grep answer | cut -d" " -f1 | sed -e "s/guess#\(.*\):/words took \1 guesses /" | sort | uniq -c

  23 words took 2 guesses 
 815 words took 3 guesses 
1408 words took 4 guesses 
  69 words took 5 guesses 
```

## Notes
This was tested on node `v14.10.0`. I think `v16` breaks it but haven't looked into why.

The author of wordle stated that he started with a wordlist of every 5 letter word, and then pared it down to "common words". Originally I still used the entire set of known 5-letter words from the commonly-used ENABLE wordlist. But since then I've changed to using the actual wordle word lists. I [include all those word lists here](./wordlists/).

The [tree files](./trees) are constantly updated so that we don't have to re-compute the best guess from a position that we've already been in. If you override any guess then you are off the rails and the tree file will no longer be updated. For instance, we don't have to compute what the best first guess is every time, because it is saved in the tree file. Similarly, once we guess `roate` as the first guess and receive a score like `00p00`, the tree file is consulted to see that we've previously computed the best guess from this position, which is `slick`.

