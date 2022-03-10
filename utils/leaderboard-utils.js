const userModel = require('../models/user');
const { paginator } = require('../utils/paginator');
const Ascii = require('ascii-table');

module.exports = {
  async getWordleLeaderboard(interaction) {
    const pages = [];
    let pageMsg = '';
    const usersData = await userModel.find().sort({ ramboPoints: -1 });
    let playersPerPage = 10;
    for (let index = 0; index < usersData.length; index += 10) {
      const currentPlayer = usersData.slice(index, playersPerPage);
      playersPerPage += 10;
      let rankNumber = index;
      const Table = new Ascii('Wordle Leaderboard');
      Table.setHeading(
        'Rank',
        'Rambo Points',
        'Username',
        'W/L',
        'Avg Guesses',
        'Invalid words'
      );
      for (const {
        userName,
        ramboPoints,
        totalGames,
        totalGuesses,
        totalWins,
        totalLosses,
        totalInvalidWords,
      } of currentPlayer) {
        Table.addRow(
          `${++rankNumber}`,
          `${ramboPoints}`,
          `${userName}`,
          `${totalWins}/${totalLosses} (${Math.round(
            (totalWins / totalGames) * 100
          )}%)`,
          `${(totalGuesses / totalGames).toFixed(2)}`,
          `${totalInvalidWords}`
        );
      }
      for (let column = 0; column < 6; column++) {
        Table.setAlign(column, Table.__nameAlign);
      }
      Table.removeBorder();
      Table.setBorder('|', '_', '.', '|');
      pageMsg = Table.toString();
      pages.push(pageMsg);
    }

    if (pages.length === 0) {
      await interaction.reply(
        `${target.user.username} has not played a game of wordle`
      );
    } else {
      paginator(interaction, pages);
    }
  },
};
