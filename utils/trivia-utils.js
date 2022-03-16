const userModel = require('../models/user');
const { createUser } = require('./util');
const { addMoney } = require('../utils/currency-system-utils');

module.exports = {
  async saveToDatabase(gameData, currencySystem, interaction) {
    let playerDocument;
    try {
      playerDocument = await userModel.find(
        { discordId: gameData.discordId },
        { triviaStats: 1 }
      );
      if (playerDocument.length === 0) {
        const triviaStats = {
          score: gameData.points,
          totalCorrectAnswers: 1,
        };

        playerDocument = await createUser(
          userModel,
          gameData.discordId,
          triviaStats
        );
      } else {
        playerDocument[0].triviaStats.score += gameData.points;
        playerDocument[0].triviaStats.totalCorrectAnswers += 1;
        await playerDocument[0].save();
      }
      await addMoney(
        currencySystem,
        gameData.points,
        gameData.discordId,
        interaction.guild.id,
        'wallet'
      );
    } catch (err) {
      console.log(err);
    }
  },
};
