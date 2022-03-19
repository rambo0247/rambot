const htmlparser2 = require('htmlparser2');

module.exports = {
  parse(unparsedText) {
    let parsedText = '';
    const parser1 = new htmlparser2.Parser({
      ontext(text) {
        parsedText += text;
      },
      onclosetag(tagname) {
        if (tagname === 'br') {
          parsedText += `\n`;
        }
      },
    });

    parser1.write(unparsedText);
    parser1.end();

    return parsedText;
  },
  randomInArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  censorText(stringToCensor, text) {
    const regEx = new RegExp(stringToCensor, 'ig');
    text = text.replaceAll(regEx, ' ----- ');
    return text;
  },
  async createUser(
    userModel,
    discordId,
    wordleStats = null,
    triviaStats = null
  ) {
    const defaultWordleStats = {
      score: 0,
      totalGames: 0,
      totalGuesses: 0,
      totalWins: 0,
      totalLosses: 0,
      totalInvalidWords: 0,
    };
    const defaultTriviaStats = {
      score: 0,
      totalCorrectAnswers: 0,
    };
    const User = await userModel.create({
      discordId: discordId,
      wordleStats: wordleStats || defaultWordleStats,
      triviaStats: triviaStats || defaultTriviaStats,
    });
    return User;
  },
  getDate() {
    // Format: monthNumber/day/year
    const date = new Date(Date.now());
    const monthNumber = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${monthNumber}/${day}/${date.getFullYear()}`;
  },
  parseSeconds(inputSeconds) {
    if (String(inputSeconds).includes('-')) return '0 Seconds';
    const days = Math.floor(parseInt(inputSeconds / (3600 * 24)));
    inputSeconds = inputSeconds % (3600 * 24);
    const hours = Math.floor(parseInt(inputSeconds / 3600));
    inputSeconds = inputSeconds % 3600;
    const minutes = Math.floor(parseInt(inputSeconds / 60));
    inputSeconds = Math.floor(parseInt(inputSeconds % 60));

    if (days) {
      return `${days} days, ${hours} hours, ${minutes} minutes`;
    } else if (hours) {
      return `${hours} hours, ${minutes} minutes, ${inputSeconds} seconds`;
    } else if (minutes) {
      return `${minutes} minutes, ${inputSeconds} seconds`;
    } else {
      return `${inputSeconds} seconds`;
    }

    // Code by https://github.com/BIntelligent/currency-system/blob/cf4cc310f2b63ebef784056df80f2e0ebb22b848/src/classes/functions.js#L909
  },
};
