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
  name: 'daily',
  description: 'Receive your daily R-Coins reward',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const user = interaction.user;
    const dailyRewardAmount = 300;
    const result = await currencySystem.daily({
      user: user,
      guild: interaction.guild.id,
      amount: dailyRewardAmount,
    });
    const dailyRewardIcon = new MessageAttachment(
      './assets/economy/gift.png',
      'gift.png'
    );
    const dailyRewardEmbed = new MessageEmbed()
      .setTitle('Daily Reward')
      .setColor('GREEN')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://gift.png')
      .setDescription(
        `You claimed your daily reward of ${dailyRewardAmount} ${rCoin}. Come back tomorrow to claim it again`
      )
      .setFooter({
        text: `Daily reward receipt • ${getDate()}`,
      });
    if (result.error) {
      return interaction.reply({
        content: `You already received your daily reward. Get your next one in ${result.time}`,
        ephemeral: true,
      });
    }
    await interaction.reply({
      embeds: [dailyRewardEmbed],
      files: [dailyRewardIcon],
    });
  },
};
