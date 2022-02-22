const { CommandInteraction, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Deletes messages',
  permissions: ['MANAGE_MESSAGES'],
  options: [
    {
      name: 'amount',
      description:
        'Select the amount of message to delete from a channel or a target.',
      type: 'NUMBER',
      required: true,
    },
    {
      name: 'target',
      description: 'Select a target to clear their messages.',
      type: 'USER',
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { channel, options } = interaction;

    const Amount = options.getNumber('amount');
    const Target = options.getMember('target');

    const Messages = await channel.messages.fetch();

    const Response = new MessageEmbed().setColor('DARK_RED');

    if (Target) {
      let i = 0;
      const filtered = [];
      Messages.filter((message) => {
        if (message.author.id === Target.id && Amount > i) {
          filtered.push(message);
          i++;
        }
      });

      await channel.bulkDelete(filtered, true).then((messages) => {
        Response.setDescription(`🧹 Cleared ${messages.size} from ${Target}.`);
        interaction.reply({ embeds: [Response] });
      });
    } else {
      await channel.bulkDelete(Amount, true).then((messages) => {
        Response.setDescription(
          `🧹 Cleared ${messages.size} from this channel.`
        );
        interaction.reply({ embeds: [Response] });
      });
    }
  },
};
