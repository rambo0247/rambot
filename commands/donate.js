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
  name: 'donate',
  description: 'Donate R-Coins to a user',
  options: [
    {
      name: 'user',
      description: 'User you want to donate to',
      type: 'USER',
      required: true,
    },
    {
      name: 'amount',
      description: 'Amount of R-Coins to donate',
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
    const amountToDonate = interaction.options.getInteger('amount');
    const userToDonateTo = interaction.options.getUser('user');
    const user = interaction.user;
    if (userToDonateTo.bot)
      return interaction.reply({
        content: 'This user is a bot.',
        ephemeral: true,
      });
    if (userToDonateTo.id === user.id)
      return interaction.reply({
        content: "You can't donate to yourself",
        ephemeral: true,
      });
    if (amountToDonate < 0) {
      return interaction.reply({
        content: "You can't donate negative R-Coins",
        ephemeral: true,
      });
    }
    const result = await currencySystem.transferMoney({
      user: user,
      user2: userToDonateTo,
      guild: interaction.guild.id,
      amount: amountToDonate,
    });
    const donationIcon = new MessageAttachment(
      './assets/economy/donation.png',
      'donation.png'
    );
    const donationEmbed = new MessageEmbed()
      .setTitle('Donation')
      .setColor('GOLD')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://donation.png')
      .setDescription(
        `${user.username} has donated ${amountToDonate} ${rCoin} to ${userToDonateTo.username}`
      )
      .setFooter({
        text: `Donation certificate • ${getDate()}`,
      });
    if (result.error) {
      return interaction.reply({
        content: "You don't have enough money in your wallet to donate",
        ephemeral: true,
      });
    }
    await interaction.reply({
      embeds: [donationEmbed],
      files: [donationIcon],
    });
  },
};
