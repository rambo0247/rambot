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
  name: 'weekly',
  description: 'Receive your weekly R-Coins reward',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const user = interaction.user;
    const weeklyRewardAmount = 300;
    const result = await currencySystem.weekly({
      user: user,
      guild: interaction.guild.id,
      amount: weeklyRewardAmount,
    });
    const weeklyRewardIcon = new MessageAttachment(
      './assets/economy/gift.png',
      'gift.png'
    );
    const weeklyRewardEmbed = new MessageEmbed()
      .setTitle('weekly Reward')
      .setColor('GREEN')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://gift.png')
      .setDescription(
        `You claimed your weekly reward of ${weeklyRewardAmount} ${rCoin}. Come back next week to claim it again`
      )
      .setFooter({
        text: `weekly reward receipt • ${getDate()}`,
      });
    if (result.error) {
      return interaction.reply({
        content: `You already received your weekly reward. Get your next one in ${result.time}`,
        ephemeral: true,
      });
    }
    await interaction.reply({
      embeds: [weeklyRewardEmbed],
      files: [weeklyRewardIcon],
    });
  },
};
