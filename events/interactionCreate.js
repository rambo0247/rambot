const { Client, MessageEmbed, CommandInteraction } = require('discord.js');
const CurrencySystem = require('currency-system');

module.exports = {
  name: 'interactionCreate',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command)
        return (
          interaction.reply({
            embeds: [
              new MessageEmbed()
                .setColor('RED')
                .setDescription(
                  '🔴 An error occurred while running this command'
                ),
            ],
          }) && client.commands.delete(interaction.commandName)
        );
      command.execute(interaction, client, currencySystem);
    }
  },
};
