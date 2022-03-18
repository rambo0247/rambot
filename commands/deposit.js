const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');
const { getDate } = require('../utils/util');
const { getUserBalance } = require('../utils/currency-system-utils');

module.exports = {
  name: 'deposit',
  description: 'Deposits R-Coins from your wallet into your bank',
  options: [
    {
      name: 'coins',
      description: 'Amount of R-Coins to deposit',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'amount',
          description: 'Amount of R-Coins to deposit',
          type: 'INTEGER',
          required: true,
        },
      ],
    },
    {
      name: 'all',
      description: 'Deposit all the your money',
      type: 'SUB_COMMAND',
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const subCommand = interaction.options.getSubcommand();
    const user = interaction.user;
    const guildId = interaction.guild.id;
    let amountToDeposit;
    if (subCommand === 'coins')
      amountToDeposit = interaction.options.getInteger('amount');
    else if (subCommand === 'all') {
      const balance = await getUserBalance(currencySystem, user, guildId);
      amountToDeposit = balance.wallet;
    }
    const result = await currencySystem.deposite({
      user: user,
      guild: guildId,
      amount: amountToDeposit,
    });
    const bankingIcon = new MessageAttachment(
      './assets/economy/banking.png',
      'banking.png'
    );
    const depositEmbed = new MessageEmbed()
      .setTitle('Deposit')
      .setColor('RANDOM')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://banking.png')
      .setFooter({
        text: `Deposit receipt • ${getDate()}`,
      });
    let embedDescription;
    if (result.error) {
      if (result.type === 'negative-money')
        embedDescription = "You can't withdraw negative R-Coins";
      if (result.type === 'low-money')
        embedDescription = "You don't have enough R-Coins in bank.";
      if (result.type === 'no-money')
        embedDescription = "You don't have any R-Coins to withdraw";
      if (result.type === 'bank-full')
        embedDescription = 'Your bank limit has been reached';
    } else {
      embedDescription = `Amount Deposited: ${amountToDeposit} ${rCoin}\nWallet: ${result.rawData.wallet} ${rCoin}\nBank: ${result.rawData.bank} ${rCoin}`;
    }
    depositEmbed.setDescription(embedDescription);
    await interaction.reply({
      embeds: [depositEmbed],
      files: [bankingIcon],
    });
  },
};
