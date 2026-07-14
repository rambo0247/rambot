const { CommandInteraction, Client } = require('discord.js');
const CurrencySystem = require('currency-system');

module.exports = {
  name: 'give',
  description: 'give money to everyone',
  permissions: ['ADMINISTRATOR'],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const wheretoPutMoney = 'bank';
    const amount = 500000;
    const money = parseInt(amount);
    const result = await currencySystem.addMoneyToAllUsers({
      guild: interaction.guild.id,
      amount: money,
      wheretoPutMoney: wheretoPutMoney,
    });
    if (result.error) {
      if (result.type === 'negative-money')
        return await interaction.reply('You cant add negitive money');
      else return await interaction.reply("No User's found");
    } else
      await interaction.reply(
        `Successfully added $${money} to ${result.rawData.length} people!, ( in ${wheretoPutMoney} )`
      );
  },
};
