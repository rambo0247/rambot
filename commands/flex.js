const { CommandInteraction, Client } = require('discord.js');
const { showRankedLeaderboard } = require('../utils/ranked-leaderboard-embed');

module.exports = {
  name: 'flex',
  description: 'View Diversity Esports flex ranks',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    await showRankedLeaderboard(interaction, {
      queueType: 'RANKED_FLEX_SR',
      title: 'Flex Standings',
    });
  },
};
