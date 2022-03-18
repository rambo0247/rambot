const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');
const { getDate } = require('../utils/util');

module.exports = {
  name: 'work',
  description: 'Work to make some R-Coins',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const user = interaction.user;
    const result = await currencySystem.work({
      user: user,
      guild: interaction.guild.id,
      maxAmount: 300,
      replies: [
        'Stripper',
        'Computer Repairer',
        'LoL Booster',
        'Water Boy',
        'Rambot Assistant',
        'Culvers Cashier',
      ],
      cooldown: 60 * 15,
    });
    if (result.error)
      return await interaction.reply({
        content: `You worked recently and your on a break. Next shift starts in ${result.time}`,
        ephemeral: true,
      });
    const workerIcon = new MessageAttachment(
      './assets/economy/worker.png',
      'worker.png'
    );
    const workEmbed = new MessageEmbed()
      .setTitle(`${result.workType} job`)
      .setColor('RANDOM')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setDescription(
        `You worked as a ${result.workType} and earned $${result.amount} ${rCoin}`
      )
      .setThumbnail('attachment://worker.png')
      .setFooter({
        text: `Salary receipt • ${getDate()}`,
      });
    await interaction.reply({
      embeds: [workEmbed],
      files: [workerIcon],
    });
  },
};
