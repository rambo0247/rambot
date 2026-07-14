const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'inventory',
  description: 'View shop items',
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'user',
      description: 'The user to view the inventory of',
      type: 6,
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const userToViewInventoryOf =
      interaction.options.getUser('user') || interaction.user;
    const result = await currencySystem.getUserItems({
      user: userToViewInventoryOf,
      guild: interaction.guild.id,
    });
    const inventory = result.inventory.slice(0, 10);
    const chestIcon = new MessageAttachment(
      './assets/economy/chest.png',
      'chest.png'
    );
    const embed = new MessageEmbed()
      .setAuthor({
        name: `${userToViewInventoryOf.username}`,
        iconURL: `${userToViewInventoryOf.displayAvatarURL()}`,
      })
      .setTitle('Inventory')
      .setDescription('Inventory is empty')
      .setThumbnail('attachment://chest.png');
    if (inventory.length > 0) {
      for (const item of inventory) {
        embed.setDescription(`**${item.name}:**\nAmount: ${item.amount}`);
      }
    }
    await interaction.reply({
      embeds: [embed],
      files: [chestIcon],
    });
  },
};
