const { guessable } = require('../assets/wordle-words/guessable.json');
const { words } = require('../assets/wordle-words/answer-words.json');
const EmojiCodes = require('../validation/EmojiCodes');
const schema = require('../models/leaderboard');
const { codeBlock } = require('@discordjs/builders');

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
    const indicesOfIncorrectLettersInGuess = [];
    const targetLetters = {};
    const emojiStrings = [];

    for (let i = 0; i < userInput.length; ++i) {
      const answerLetter = answer[i];

      if (answerLetter in targetLetters) {
        targetLetters[answerLetter]++;
      } else {
        targetLetters[answerLetter] = 1;
      }

      if (userInput[i] === answerLetter) {
        emojiStrings[i] = `${EmojiCodes.green[userInput[i]]}`;
        targetLetters[answerLetter]--;
      } else {
        indicesOfIncorrectLettersInGuess.push(i);
      }
    }
    for (const i of indicesOfIncorrectLettersInGuess) {
      const guessLetter = userInput[i];

      if (guessLetter in targetLetters && targetLetters[guessLetter] > 0) {
        emojiStrings[i] = `${EmojiCodes.yellow[guessLetter]}`;
        targetLetters[guessLetter]--;
      } else {
        emojiStrings[i] = `${EmojiCodes.gray[guessLetter]}`;
      }
    }
    return emojiStrings.join('');
  },
  async saveToDatabase(gameData) {
    let playerDocument;
    try {
      playerDocument = await schema.find({ discordId: gameData.discordId });
      if (playerDocument.length === 0) {
        playerDocument = await schema.create({
          discordId: gameData.discordId,
          userName: gameData.userName,
          ramboPoints: gameData.ramboPoints,
          totalGames: 1,
          totalGuesses: gameData.guessCount,
          totalWins: gameData.isWin ? 1 : 0,
          totalLosses: gameData.isWin ? 0 : 1,
          totalInvalidWord: gameData.invalidWordCount,
        });
      } else {
        playerDocument[0].ramboPoints += gameData.ramboPoints;
        playerDocument[0].totalGames += 1;
        playerDocument[0].totalGuesses += gameData.guessCount;
        playerDocument[0].totalWins += gameData.isWin ? 1 : 0;
        playerDocument[0].totalLosses += gameData.isWin ? 0 : 1;
        playerDocument[0].totalInvalidWords += gameData.invalidWordCount;
        await playerDocument[0].save();
      }
    } catch (err) {
      console.log(err);
    }
  },
  getGameEndField(guessCount, ramboPoints, answerWord) {
    let fieldName = '';
    let fieldValue = `= +${ramboPoints}RP =`;
    switch (guessCount) {
      case 1:
        fieldName = 'Stop hacking!';
        break;
      case 2:
        fieldName = "You're Smurfing!";
        break;
      case 3:
        fieldName = 'Impressive!';
        break;
      case 4:
        fieldName = 'Good job!';
        break;
      case 5:
        fieldName = 'Nice!';
        break;
      case 6:
        fieldName = 'You almost inted';
        break;
    }
    if (ramboPoints < 0) {
      fieldName = 'Buy a dictionary';
      fieldValue = `= ${answerWord} ${ramboPoints}RP =`;
    }
    fieldValue = codeBlock('asciidoc', fieldValue);
    return { fieldName, fieldValue };
  },
};
