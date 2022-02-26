const {
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
module.exports = {
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async paginator(interaction, pages) {
    if (!interaction) throw new Error('Provide interaction');
    if (!pages) throw new Error('Provide pages');
    let pageNumber = 0;
    const leaderboardTime = 1000 * 15;
    const prevButton = new MessageButton()
      .setCustomId('prev')
      .setStyle('PRIMARY')
      .setEmoji('⬅');
    const nextButton = new MessageButton()
      .setCustomId('next')
      .setStyle('PRIMARY')
      .setEmoji('▶');
    const row = new MessageActionRow().addComponents([prevButton, nextButton]);

    const disabledPrevButton = new MessageButton()
      .setCustomId('prev-Disabled')
      .setStyle('PRIMARY')
      .setEmoji('⬅')
      .setDisabled();
    const disabledNextButton = new MessageButton()
      .setCustomId('next-Disabled')
      .setStyle('PRIMARY')
      .setEmoji('▶')
      .setDisabled();
    const disabledRow = new MessageActionRow().addComponents([
      disabledPrevButton,
      disabledNextButton,
    ]);

    await interaction.reply({
      content: `${codeBlock('css', pages[0])}Page ${pageNumber + 1} of ${
        pages.length
      }`,
      components: pages.length === 1 ? [disabledRow] : [row],
    });

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (msg) => msg.user.id === interaction.user.id,
      time: leaderboardTime,
    });

    collector.on('collect', async (button) => {
      await button.deferUpdate();
      if (button.customId === 'next') {
        pageNumber = pageNumber + 1 < pages.length ? ++pageNumber : 0;
      } else if (button.customId === 'prev') {
        pageNumber = pageNumber > 0 ? --pageNumber : pages.length - 1;
      }
      await interaction.editReply({
        content: `${codeBlock('css', pages[pageNumber])}Page ${
          pageNumber + 1
        } of ${pages.length}`,
        components: [row],
      });
    });

    collector.on('end', async () => {
      await interaction.editReply({
        content: `${codeBlock('css', pages[pageNumber])}Page ${
          pageNumber + 1
        } of ${pages.length}`,
        components: [disabledRow],
      });
    });

    return pages[pageNumber];
  },
};
