const { CommandInteraction } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Replies with pong',
  /**
   *
   * @param {CommandInteraction} interaction
   */
  execute(interaction) {
    interaction.reply({ content: 'PONG' });
  },
};
