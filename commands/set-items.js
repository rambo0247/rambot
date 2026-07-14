const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'set-items',
  description: 'Set shop items',
  permissions: ['ADMINISTRATOR'],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const result = await currencySystem.setItems({
      guild: interaction.guild.id,
      shop: [
        {
          name: 'Rocky Bałboa LoL Account',
          price: 50000000,
          description: 'LoL Account. Diamond elo with jungle champions',
        },
        {
          name: 'Personal Colored Role',
          price: 1,
          description: 'Role of your choice, any color',
        },
        {
          name: 'Personal Uncolored Role',
          price: 1000000,
          description: 'Role of your choice, default color',
        },
        {
          name: 'Prioritize Role',
          price: 500000,
          description: 'Your role is moved up and is your primary color',
        },
        {
          name: 'Spread Role',
          price: 750000,
          description: 'Give your role to 3 users',
        },
        {
          name: 'Upgrade Uncolored Role',
          price: 1000000,
          description: 'Color your default colored role',
        },
        {
          name: 'Personal Voice Channel',
          price: 5000000,
          description: 'Private voice channel of your choice',
        },
        {
          name: 'Public Voice Channel',
          price: 2500000,
          description: 'Public voice channel of your choice',
        },
        {
          name: 'Personal Text Channel',
          price: 4000000,
          description: 'Private text channel of your choice',
        },
        {
          name: 'Public Text Channel',
          price: 2000000,
          description: 'Public text channel of your choice',
        },
        {
          name: 'Channel Access to 3 users',
          price: 500000,
          description: 'Give 3 users access to your private channel',
        },
      ],
    });
  },
};
