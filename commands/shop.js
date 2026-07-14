const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'shop',
  description: 'View shop items',
  permissions: ['ADMINISTRATOR'],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const result = await currencySystem.getShopItems({
      guild: interaction.guild.id,
    });
    const shopIcon = new MessageAttachment(
      './assets/economy/shop.png',
      'shop.png'
    );
    const shopItems = result.inventory;
    const embed = new MessageEmbed()
      .setTitle('Shop')
      .setThumbnail('attachment://shop.png')
      .setFooter({ text: 'To purchase an item use /buy <item-number>' });
    for (const index in shopItems) {
      embed.addField(
        `${parseInt(index) + 1} - ${shopItems[index].name}: ${shopItems[
          index
        ].price.toLocaleString('en-US')} ${rCoin}`,
        `Description: ${shopItems[index].description}`
      );
    }
    interaction.reply({
      embeds: [embed],
      files: [shopIcon],
    });
  },
};
