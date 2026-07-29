const { CommandInteraction, Client } = require('discord.js');
const { showRankedLeaderboard } = require('../utils/ranked-leaderboard-embed');

module.exports = {
  name: 'solos',
  description: 'View Diversity Esports solo/duo ranks',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    await showRankedLeaderboard(interaction, {
      queueType: 'RANKED_SOLO_5x5',
      title: 'Solo/Duo Standings',
    });
  },
};
