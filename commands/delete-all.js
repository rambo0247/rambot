const { CommandInteraction } = require('discord.js');

const LOADING_DURATION_MS = 5 * 60 * 1000;
const UPDATE_INTERVAL_MS = 30 * 1000;

module.exports = {
  name: 'delete-all',
  description: 'Deletes all messages in channel history',
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const startedAt = Date.now();
    let fakeDeleted = 0;

    await interaction.editReply({
      content:
        '🗑️ Deleting all messages in history... this may take a while.',
    });

    while (Date.now() - startedAt < LOADING_DURATION_MS) {
      await sleep(UPDATE_INTERVAL_MS);
      fakeDeleted += Math.floor(Math.random() * 40) + 10;
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      await interaction.editReply({
        content: `🗑️ Deleting all messages in history...\nProgress: ~${fakeDeleted} messages removed (${elapsedSeconds}s elapsed)`,
      });
    }

    await interaction.editReply({
      content: 'gotcha 😂 nothing was deleted',
    });
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
