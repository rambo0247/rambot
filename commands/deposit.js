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
      description: 'Deposit specified R-Coins from your wallet into your bank',
      type: 1,
      options: [
        {
          name: 'amount',
          description: 'Amount of R-Coins to deposit',
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: 'all',
      description: 'Deposit all your money',
      type: 1,
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
        embedDescription = "You can't deposit negative R-Coins";
      if (result.type === 'low-money')
        embedDescription = "You don't have enough R-Coins in your wallet.";
      if (result.type === 'no-money' || result.type === 'money')
        embedDescription = "You don't have any R-Coins to deposit";
      if (result.type === 'bank-full')
        embedDescription = 'Your wallet limit has been reached';
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
