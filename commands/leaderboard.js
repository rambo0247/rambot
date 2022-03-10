const { CommandInteraction } = require('discord.js');
const userIds = new Set();
const {
  getWordleLeaderboard,
  getTriviaLeaderboard,
} = require('../utils/leaderboard-utils');
const availableGameNames = '(wordle, trivia)';
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
   */
  async execute(interaction) {
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
        await getWordleLeaderboard(interaction);
        break;
      case 'trivia':
        await getTriviaLeaderboard(interaction);
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
