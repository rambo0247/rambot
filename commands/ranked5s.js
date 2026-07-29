const { CommandInteraction, Client } = require('discord.js');
const { showRankedLeaderboard } = require('../utils/ranked-leaderboard-embed');

module.exports = {
  name: 'ranked5s',
  description: 'View Diversity Esports ranked 5s ranks',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    await showRankedLeaderboard(interaction, {
      queueType: 'RANKED_PREMADE_5x5',
      title: 'Ranked 5v5 Standings',
    });
  },
};
