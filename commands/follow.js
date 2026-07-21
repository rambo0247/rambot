const { CommandInteraction } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection,
} = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'assets', 'sounds');

module.exports = {
  name: 'follow',
  description: 'Follow someone into voice chat and serenade them',
  options: [
    {
      name: 'target',
      description: 'Select a target in a voice channel.',
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

    const target = interaction.options.getMember('target');
    const voiceChannel = target?.voice?.channel;

    if (!voiceChannel) {
      return interaction.editReply({
        content: 'That user is not in a voice channel.',
      });
    }

    if (getVoiceConnection(interaction.guild.id)) {
      return interaction.editReply({
        content: 'I am already busy following someone.',
      });
    }

    const sounds = fs
      .readdirSync(SOUNDS_DIR)
      .filter((file) => file.endsWith('.mp3'));
    if (sounds.length === 0) {
      return interaction.editReply({ content: 'No sounds found to play.' });
    }
    const sound = sounds[Math.floor(Math.random() * sounds.length)];

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 10_000);

      const player = createAudioPlayer();
      const resource = createAudioResource(path.join(SOUNDS_DIR, sound));
      connection.subscribe(player);
      player.play(resource);

      await interaction.editReply({
        content: `🔊 Following ${target} into **${voiceChannel.name}**...`,
      });

      await entersState(player, AudioPlayerStatus.Playing, 5_000);
      // Wait for the sound to finish (cap at 15s just in case)
      await entersState(player, AudioPlayerStatus.Idle, 15_000).catch(
        () => null
      );
    } catch (error) {
      console.error('follow command failed:', error);
      connection.destroy();
      return interaction.editReply({
        content: 'Could not join or play in that voice channel.',
      });
    }

    connection.destroy();
    await interaction.editReply({
      content: `🔊 Delivered a little gift to ${target}. You are welcome.`,
    });
  },
};
