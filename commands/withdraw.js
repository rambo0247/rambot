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
  name: 'withdraw',
  description: 'Withdraws R-Coins from your bank into your wallet',
  options: [
    {
      name: 'amount',
      description: 'Amount of R-Coins to withdraw',
      type: 'INTEGER',
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
    const amountToWithdraw = interaction.options.getInteger('amount');
    const user = interaction.user;
    const result = await currencySystem.withdraw({
      user: user,
      guild: interaction.guild.id,
      amount: amountToWithdraw,
    });
    const bankingIcon = new MessageAttachment(
      './assets/economy/banking.png',
      'banking.png'
    );
    const date = new Date(Date.now());
    const withdrawEmbed = new MessageEmbed()
      .setTitle('Withdrawal')
      .setColor('RANDOM')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://banking.png')
      .setFooter({
        text: `Withdrawal receipt • ${getDate()}`,
      });
    let embedDescription;
    if (result.error) {
      if (result.type === 'negative-money')
        embedDescription = "You can't withdraw negative R-Coins";
      if (result.type === 'low-money')
        embedDescription = "You don't have enough R-Coins in bank.";
      if (result.type === 'no-money')
        embedDescription = "You don't have any R-Coins to withdraw";
    } else {
      embedDescription = `Withdrawn Amount: ${amountToWithdraw} ${rCoin}\nWallet: ${result.rawData.wallet} ${rCoin}\nBank: ${result.rawData.bank} ${rCoin}`;
    }
    withdrawEmbed.setDescription(embedDescription);
    await interaction.reply({
      embeds: [withdrawEmbed],
      files: [bankingIcon],
    });
  },
};
