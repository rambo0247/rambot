const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'coinflip',
  description: 'Bet R-Coins with 50-50 chance of winning or losing',
  options: [
    {
      name: 'bet',
      description: 'Amount of money to bet (minimum: 50)',
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
    const user = interaction.user;
    const betAmount = interaction.options.getInteger('bet');
    const result = await currencySystem.gamble({
      user: user,
      guild: interaction.guild.id,
      amount: betAmount,
      minAmount: 50,
      cooldown: 60,
    });
    const coinflipEmbed = new MessageEmbed().setTitle('Coinflip').setAuthor({
      name: user.username,
      iconURL: `${user.displayAvatarURL()}`,
    });
    let embedFieldName;
    let emebedFieldValue;
    if (result.error) {
      if (result.type == 'low-money')
        return await interaction.reply({
          content: `You do not have enough money in your wallet for this bet`,
          ephemeral: true,
        });
      if (result.type == 'gamble-limit')
        return await interaction.reply({
          content: `Please enter a valid bet amount, minimum is ${result.minAmount} ${rCoin}`,
          ephemeral: true,
        });
      if (result.type == 'time')
        return await interaction.reply({
          content: `Calm down this is not your solo queue games, you can coinflip again in ${result.second}`,
          ephemeral: true,
        });
    }
    let loseIcon;
    let winIcon;
    if (result.type == 'lost') {
      loseIcon = new MessageAttachment(
        './assets/slots/lose-icon.png',
        'lose-icon.png'
      );
      embedFieldName = 'Loser';
      emebedFieldValue = `You lost ${result.amount} ${rCoin}`;
      coinflipEmbed.setThumbnail(`attachment://lose-icon.png`);
      coinflipEmbed.setColor('RED');
    } else if (result.type == 'won') {
      winIcon = new MessageAttachment(
        './assets/slots/win-pair.png',
        'win-pair.png'
      );
      embedFieldName = 'Winner';
      emebedFieldValue = `You won ${result.amount} ${rCoin}`;
      coinflipEmbed.setThumbnail(`attachment://win-pair.png`);
      coinflipEmbed.setColor('GREEN');
    }
    coinflipEmbed.addField(
      `${embedFieldName}`,
      `${emebedFieldValue}\nYou now have ${result.wallet} ${rCoin}`
    );
    await interaction.reply({
      embeds: [coinflipEmbed],
      files: [winIcon || loseIcon],
    });
  },
};
