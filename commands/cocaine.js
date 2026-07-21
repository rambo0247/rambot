const { CommandInteraction } = require("discord.js");

const DURATION_MS = 5 * 1000;
const MOVE_INTERVAL_MS = 300;

module.exports = {
  name: "cocaine",
  description: "Give someone in voice chat a little energy boost",
  options: [
    {
      name: "target",
      description: "Select a target in a voice channel.",
      type: 6,
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const target = interaction.options.getMember("target");
    const originalChannel = target?.voice?.channel;

    if (!originalChannel) {
      return interaction.editReply({
        content: "That user is not in a voice channel.",
      });
    }

    const voiceChannels = interaction.guild.channels.cache.filter(
      (channel) =>
        channel.isVoice() &&
        channel.id !== originalChannel.id &&
        channel
          .permissionsFor(interaction.guild.me)
          .has(["CONNECT", "MOVE_MEMBERS"]),
    );

    if (voiceChannels.size === 0) {
      return interaction.editReply({
        content: "No other voice channels to bounce them through.",
      });
    }

    await interaction.editReply({
      content: `💊 ${target} is feeling the rush...`,
    });

    const channels = [...voiceChannels.values()];
    const startedAt = Date.now();

    try {
      while (Date.now() - startedAt < DURATION_MS) {
        if (!target.voice.channel) break;
        const randomChannel =
          channels[Math.floor(Math.random() * channels.length)];
        await target.voice.setChannel(randomChannel);
        await sleep(MOVE_INTERVAL_MS);
      }

      if (target.voice.channel) {
        await target.voice.setChannel(originalChannel);
      }
    } catch (error) {
      console.error("cocaine command failed:", error);
      return interaction.editReply({
        content: "Could not move that user. Do I have Move Members permission?",
      });
    }

    await interaction.editReply({
      content: `💊 ${target} has come back down.`,
    });
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
