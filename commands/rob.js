const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'rob',
  description: 'Attempts to rob a user',
  options: [
    {
      name: 'user',
      description: 'User to rob',
      type: 'USER',
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
    const userToRob = interaction.options.getUser('user');
    const user = interaction.user;
    if (userToRob.bot)
      return interaction.reply({
        content: 'This user is a bot.',
        ephemeral: true,
      });
    if (userToRob.id === user.id)
      return interaction.reply({
        content: "You can't rob yourself",
        ephemeral: true,
      });
    await interaction.channel.send(`${userToRob.toString()}`);
    const minAmountToRob = 20;
    const maxAmountToRob = 100;
    const result = await currencySystem.rob({
      user: user,
      user2: userToRob,
      guild: interaction.guild.id,
      minAmount: minAmountToRob,
      successPercentage: 5,
      cooldown: 3600,
      maxRob: maxAmountToRob,
    });
    const robberIcon = new MessageAttachment(
      './assets/economy/robber.png',
      'robber.png'
    );
    const date = new Date(Date.now());
    const robEmbed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor({
        name: user.username,
        iconURL: `${user.displayAvatarURL()}`,
      })
      .setTitle('Robbing Report')
      .setThumbnail('attachment://robber.png')
      .setFooter({
        text: `Robbery Report • ${date.getMonth()}/${date.getDay()}/${date.getFullYear()}`,
      });
    let embedDescription;
    if (result.error) {
      if (result.type === 'time')
        embedDescription = `Stop robbing people, work to make R-Coins. You can rob again in ${result.time}`;
      if (result.type === 'low-money')
        embedDescription = `You need atleast ${result.minAmount} ${rCoin} to rob someone`;
      if (result.type === 'low-wallet')
        embedDescription = `You can't rob ${result.user2.username}. They have less than ${result.minAmount} ${rCoin} in their wallet`;
      if (result.type === 'caught')
        embedDescription = `${interaction.user.username} tried robbing ${result.user2.username} but Korea screenshotted it and started laughing. You got caught and ended up paying ${result.amount} ${rCoin} to ${result.user2.username}!`;
    } else if (result.type === 'success')
      embedDescription = `${interaction.user.username} successfully robbed ${result.user2.username} and got away with ${result.amount} ${rCoin}`;
    robEmbed.setDescription(embedDescription);
    await interaction.reply({
      content: `${userToRob.toString()}`,
      embeds: [robEmbed],
      files: [robberIcon],
    });
  },
};
