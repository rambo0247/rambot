const { CommandInteraction, Client } = require('discord.js');
const userIds = new Set();
const {
  getWordleLeaderboard,
  getTriviaLeaderboard,
  getBalanceLeaderboard,
} = require('../utils/leaderboard-utils');
const availableGameNames = '(wordle, trivia, rcoins)';
const CurrencySystem = require('currency-system');
module.exports = {
  name: 'leaderboard',
  description: 'Displays leaderboard for a certain game.',
  options: [
    {
      name: 'for',
      description: `Name of game for which leaderboard you want to view ${availableGameNames}.`,
      type: 'STRING',
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const userId = interaction.user.id;
    if (userIds.has(userId)) {
      await interaction.reply(
        'Leaderboard is still up, wait until buttons are disabled to use command again'
      );
      return;
    }
    const gameName = interaction.options.getString('for').toLowerCase();

    switch (gameName) {
      case 'wordle':
        await getWordleLeaderboard(interaction, client);
        break;
      case 'trivia':
        await getTriviaLeaderboard(interaction, client);
        break;
      case 'balance':
        await getBalanceLeaderboard(interaction, client, currencySystem);
        break;
      default:
        await interaction.reply({
          content: `There is no leaderboard for that game, choose a valid game ${availableGameNames}.`,
          ephemeral: true,
        });
        return;
    }

    userIds.add(userId);

    setTimeout(() => {
      userIds.delete(userId);
    }, 1000 * 15);
  },
};
