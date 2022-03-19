const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { getDate } = require('../utils/util');
const { getUserCommandsCooldowns } = require('../utils/currency-system-utils');

module.exports = {
  name: 'cooldowns',
  description: 'Check your command cooldowns',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const user = interaction.user;
    const hourglassIcon = new MessageAttachment(
      './assets/general/hourglass.png',
      'hourglass.png'
    );
    const embed = new MessageEmbed()
      .setTitle('Cooldowns')
      .setColor('RANDOM')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://hourglass.png')
      .setFooter({
        text: `Cooldowns information • ${getDate()}`,
      });
    const commandsCooldownInfo = await getUserCommandsCooldowns(
      currencySystem,
      interaction
    );
    embed.setDescription(commandsCooldownInfo);
    await interaction.reply({
      embeds: [embed],
      files: [hourglassIcon],
    });
  },
};
