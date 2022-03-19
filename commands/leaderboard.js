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
  description: 'Displays leaderboard for a certain category',
  options: [
    {
      name: 'category',
      description: 'Category to view leaderboard for',
      type: 3,
      required: true,
      choices: [
        {
          name: 'wordle',
          value: 'wordle',
        },
        {
          name: 'trivia',
          value: 'trivia',
        },
        {
          name: 'rcoins',
          value: 'rcoins',
        },
      ],
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
    const gameName = interaction.options.get('category').value;

    switch (gameName) {
      case 'wordle':
        await getWordleLeaderboard(interaction, client);
        break;
      case 'trivia':
        await getTriviaLeaderboard(interaction, client);
        break;
      case 'rcoins':
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
