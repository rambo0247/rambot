const { guessable } = require('../assets/wordle-words/guessable.json');
const { words } = require('../assets/wordle-words/answer-words.json');
const EmojiCodes = require('../validation/EmojiCodes');

let wordsArray = [...words];

module.exports = {
  getAnswerWord() {
    if (wordsArray.length === 0) {
      wordsArray = [...words];
    }
    const index = Math.floor(Math.random() * wordsArray.length);
    const answer = wordsArray[index].toLowerCase();
    wordsArray.splice(index, 1);
    return answer;
  },
  isWordGuessable(userInput) {
    const guessableWords = new Set(guessable);
    if (guessableWords.has(userInput)) return true;
    return false;
  },
  colorLetters(userInput, answer) {
    let emojiString = '';
    const unguessedLetters = [...answer];

    for (let i = 0; i < userInput.split('').length; i++) {
      if (unguessedLetters.includes(userInput[i])) {
        if (answer[i] === userInput[i]) {
          emojiString += `${EmojiCodes.green[letter]}`;
        } else {
          emojiString += `${EmojiCodes.yellow[letter]}`;
        }
        const index = unguessedLetters.indexOf(userInput[i]);
        unguessedLetters.splice(index, 1);
      } else {
        emojiString += `${EmojiCodes.gray[letter]}`;
      }
    }
    return emojiString;
  },
};
