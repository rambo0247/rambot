const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'buy',
  description: 'View shop items',
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'item-id',
      description: 'The id of the item you wish to buy',
      type: 4,
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
    const itemId = interaction.options.getInteger('item-id');
    const result = await currencySystem.buy({
      user: interaction.user,
      guild: interaction.guild.id,
      item: itemId,
    });
    const shopItems = result.inventory;
    const embed = new MessageEmbed()
      .setTitle('Shop')
      .setThumbnail('attachment://shop.png')
      .setFooter({ text: 'To purchase an item use /buy <item-id>' });
    if (result.error) {
      if (result.type === 'No-Item')
        return await interaction.reply('Please provide valid item id');
      if (result.type === 'Invalid-Item')
        return await interaction.reply('item does not exists');
      if (result.type === 'low-money')
        return await interaction.reply(
          `**You don't have enough R-Coins to buy this item!**`
        );
    } else
      return await interaction.reply(
        `**Successfully bought  \`${result.inventory.name}\` for $${result.inventory.price}**`
      );
    // interaction.reply({
    //   embeds: [embed],
    //   files: [shopIcon],
    // });
  },
};
