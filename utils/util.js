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
};
