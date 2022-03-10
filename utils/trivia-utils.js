const userModel = require('../models/user');
const { createUser } = require('./util');

module.exports = {
  async saveToDatabase(gameData) {
    let playerDocument;
    try {
      playerDocument = await userModel.find(
        { discordId: gameData.discordId },
        { ramboPoints: 1, triviaStats: 1 }
      );
      if (playerDocument.length === 0) {
        const triviaStats = {
          score: questionPoints,
          totalCorrectAnswers: 1,
        };

        playerDocument = await createUser(
          userModel,
          gameData.discordId,
          gameData.userName,
          gameData.points,
          triviaStats
        );
      } else {
        playerDocument[0].ramboPoints += gameData.points;
        playerDocument[0].triviaStats.score += gameData.points;
        playerDocument[0].triviaStats.totalCorrectAnswers += 1;
        await playerDocument[0].save();
      }
    } catch (err) {
      console.log(err);
    }
  },
};
