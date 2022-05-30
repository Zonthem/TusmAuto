import input from '@inquirer/input';
import * as fs from 'fs';

var corrects = [];
var all = [];
var guesses = [];
var impossibles = [];

const dic = {
  list: []
}

function isLetter(str) {
  return str.length === 1 && /[a-z]/i.test(str);
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function readJSONFile() {
  let raw = fs.readFileSync('dic.json');
  dic.list = JSON.parse(raw).list;
}

function removeFromDic(word) {
  //remove locally
  dic.list.splice(
    dic.list.indexOf(guess),
    1
  )

  //remove in JSON by writing the local dic
  fs.writeFileSync('dic.json', JSON.stringify(dic), { flag: 'w+' });
}

function getRandomValidWord() {
  if (dic.list.length === 0) {
    readJSONFile();
  }

  let randomWord = '%';

  dic.list.every(word => {
    if (word.length === corrects.length && corrects[0] === word[0]) {
      let wordIsValid = true;
      for (let correctLetterIndex in corrects) {
        if (corrects[correctLetterIndex] !== 0 && corrects[correctLetterIndex] !== word[correctLetterIndex]) {
          wordIsValid = false;
          break;
        }
      }

      if (wordIsValid) {
        randomWord = word;
        return false;
      }
    }
    return true;
  })

  return randomWord;
}

function getListOfValidWords() {
  if (dic.list.length === 0) {
    readJSONFile();
  }

  let list = [];
  let valid;

  dic.list.every(word => {
    valid = true;

    //check size
    if (word.length !== corrects.length) {
      valid = false;
      return true;
    }

    //check known letters
    for (let correctLetterIndex in corrects) {
      if (corrects[correctLetterIndex] !== 0 && corrects[correctLetterIndex] !== word[correctLetterIndex]) {
        valid = false;
        return true;
      }
    }

    //check other letters
    all.forEach(element /* {letter: '', occurence: 0, complete: true} */ => {
      let regex = new RegExp(element.letter, 'gi')
      if (element.occurence === 0 && word.match(regex)?.length > 0) {
        valid = false;
        return true;
      }
      if ((word.match(regex)?.length < element.occurence) || (word.match(regex)?.length === undefined && element.occurence > 0)) {
        valid = false;
        return true;
      }
      if (word.match(regex)?.length > element.occurence && element.complete) {
        valid = false;
        return true;
      }
    });

    //delete impossible results
    for (let impossibleIndex in impossibles) {
      if (impossibles[impossibleIndex].includes(word[impossibleIndex])) {
        valid = false;
        return true;
      }
    }

    if (valid) {
      list.push(word)
    }

    return true;
  });

  return list;
}

function processResult(g, gr) {
  guesses.push(g);

  //Process all[]
  let count = [];
  for (let index in gr) {

    let currentCount;

    if (gr[index] === '1' || gr[index] === '2') {
      if (count.find(el => el.letter === g[index]) === undefined) {
        count.push({ letter: g[index], occurence: 0, complete: false })
      }
      currentCount = count.find(el => el.letter === g[index]);
      currentCount.occurence += 1;
    }

    if (gr[index] === '0') {
      if (count.find(el => el.letter === g[index]) === undefined) {
        count.push({ letter: g[index], occurence: 0, complete: false });
      }
      currentCount = count.find(el => el.letter === g[index]);
      currentCount.complete = true;
    }
  }

  //save de count[] pour les prochains mots
  count.forEach(element => {
    let currentAllElement = all.find(el => el.letter === element.letter)
    if (currentAllElement == undefined) {
      all.push(element);
    } else {
      if (element.occurence > currentAllElement.occurence) {
        if (currentAllElement.complete) {
          console.error(`Grosse connerie at letter ${element.letter}, censé être fini à ${currentAllElement.occurence} mais en fait y'en a ${element.occurence}`);
        }
        currentAllElement.occurence = element.occurence;
      }
      if (element.complete && !currentAllElement.complete) {
        currentAllElement.complete = true;
      }
    }
  })

  //process corrects[]
  for (let index in gr) {
    if (gr[index] === '2') {
      if (corrects[index] !== 0 && corrects[index] !== g[index]) {
        console.log(`Attention, on modifie à l'index '${index}' ${corrects[index]} par ${g[index]} ...`);
      }
      corrects[index] = g[index];
    }
  }

  //process impossibles[]
  for (let index in gr) {
    console.log(impossibles);
    if (gr[index] === '0' || gr[index] === '1') {
      impossibles[index].push(g[index]);
    }
  }
}


//longueur du mot
const length = await input({ message: 'Quelle taille fait le mot ?', validate: (value) => isNumeric(value) || 'Tape un chiffre enculé.' });
corrects = new Array(+length).fill(0);
// impossibles = new Array(+length).fill(new Array(0));
impossibles = Array.from(Array(+length), () => new Array());

//première lettre
const firstLetter = await input({ message: 'Quelle est la première lettre ?', validate: (value) => isLetter(value) || 'Tape une lettre enculé.' });
corrects[0] = firstLetter.toUpperCase();
all.push({
  letter: firstLetter.toUpperCase(),
  occurence: 1,
  complete: false
})

let guess = getRandomValidWord();
let guessResult = '';

while (guess !== '%') {
  guessResult = await input({
    message: `Teste le mot ${guess}`,
    validate: (value) => {
      let reg = new RegExp(`[012]{${corrects.length}}`);
      return value === '&'
        || (
          value.length === corrects.length
          && reg.test(value)
        ) || '0 = absent, 1 = mal placé, 2 = correct ... C\'est pas dur putain de merde ! & si le mot n\'est pas valide aussi.';
    }
  });
  if (guessResult === '&') {
    removeFromDic(guess);
  } else {
    //end process if success
    if (/^2*$/g.test(guessResult)) {
      console.log("GG moi, encore ...");
      process.exit(0);
    }

    processResult(guess, guessResult);
  }

  let list = getListOfValidWords();
  console.log('all      :', all);
  console.log('corrects :', corrects);
  console.log('imp      :', impossibles);
  console.log('guesses  :', guesses);
  console.log('new list :', list);
  guess = list[Math.floor(Math.random() * list.length)];
}

console.log('end : ' + guess);