const {
  CommandInteraction,
  Client,
  MessageEmbed,
  MessageAttachment,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  name: 'use',
  description: 'Uses an item',
  permissions: ['ADMINISTRATOR'],
  options: [
    {
      name: 'item',
      description: 'Name of the item you want to use',
      type: 3,
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
    const itemNameToUse = interaction.options.getString('item');
    let isItemInInventory = false;
    const user = interaction.user;
    const guild = interaction.guild;
    const userItems = await currencySystem.getUserItems({
      user: user,
      guild: guild.id,
    });
    let itemIndex;
    for (const index in userItems.inventory) {
      if (
        userItems.inventory[index].name.toLowerCase() ===
        itemNameToUse.toLowerCase()
      ) {
        isItemInInventory = true;
      }
      itemIndex = index;
    }
    if (isItemInInventory) {
      const result = await currencySystem.removeUserItem({
        user: user,
        guild: guild.id,
        item: itemIndex + 1,
      });
      if (result.error) {
        console.log(result);
        return await interaction.reply('Unknown error occured see console.');
      }
      switch (userItems.inventory[itemIndex].name.toLowerCase()) {
        case 'personal colored role':
          const roles = await interaction.guild.roles.fetch();
          await interaction.reply('Enter role name');
          const collector = interaction.channel.createMessageCollector({
            filter: (m) => interaction.user.id === m.author.id,
            time: 60000,
          });

          let roleName = '';
          let roleColor = '';

          collector.on('collect', async (msg, col) => {
            if (!roleName) {
              const roleExists = roles.some(
                (role) => role.name.toLowerCase() === msg.content.toLowerCase()
              );
              if (roleExists) {
                await interaction.channel.send(
                  'That role alreasy exists, enter another name'
                );
              } else {
                roleName = msg.content;
                await interaction.channel.send('Enter role color');
                collector.resetTimer();
              }
            } else if (!roleColor) {
              roleColor = msg.content.toUpperCase();
              collector.stop();
            }
          });

          collector.on('end', async (collected) => {
            if (roleName && roleColor) {
              const role = await guild.roles.create({
                name: roleName,
                color: roleColor,
              });
              await interaction.member.roles.add(role);
              await interaction.followUp(
                `Role "${roleName}" created and added to user`
              );
            } else {
              await interaction.reply('No input received, operation cancelled');
            }
          });
          break;
      }
    } else {
      return await interaction.reply('Please buy the item first!');
    }
  },
};
