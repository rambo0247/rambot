const { CommandInteraction } = require('discord.js');
const flexPlayersModel = require('../models/players.js');

module.exports = {
  name: 'add-to-leaderboard',
  description: 'Add a summoner to the ranked leaderboards',
  options: [
    {
      name: 'summoner',
      description: 'Riot ID in the form Name#Tag (e.g. Rambo#North)',
      type: 3,
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply();

    const summonerInput = interaction.options.getString('summoner').trim();
    const hashIndex = summonerInput.indexOf('#');

    if (
      hashIndex === -1 ||
      hashIndex === 0 ||
      hashIndex === summonerInput.length - 1
    ) {
      return interaction.editReply({
        content: 'Invalid format. Use `Name#Tag` (e.g. `Rambo#North`).',
      });
    }

    const gameName = summonerInput.slice(0, hashIndex).trim();
    const tagLine = summonerInput.slice(hashIndex + 1).trim();

    if (!gameName || !tagLine) {
      return interaction.editReply({
        content: 'Invalid format. Use `Name#Tag` (e.g. `Rambo#North`).',
      });
    }

    let account;
    try {
      const response = await fetch(
        `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}`,
        {
          method: 'GET',
          headers: {
            'X-Riot-Token': process.env.RIOT_API_KEY,
          },
        }
      );

      if (response.status === 404) {
        return interaction.editReply({
          content: `Could not find summoner \`${gameName}#${tagLine}\`.`,
        });
      }

      if (!response.ok) {
        console.error(
          `Failed to fetch account for ${gameName}#${tagLine}: ${response.status}`
        );
        return interaction.editReply({
          content: `Riot API error (${response.status}). Try again later.`,
        });
      }

      account = await response.json();
    } catch (error) {
      console.error(
        `Failed to fetch account for ${gameName}#${tagLine}:`,
        error
      );
      return interaction.editReply({
        content: 'Failed to reach Riot API. Try again later.',
      });
    }

    const { puuid, gameName: resolvedName } = account;
    if (!puuid) {
      return interaction.editReply({
        content: 'Riot API returned an unexpected response.',
      });
    }

    const displayName = resolvedName || gameName;
    const existing = await flexPlayersModel
      .findOne({
        $or: [{ summonerId: puuid }, { name: displayName }],
      })
      .lean();

    if (existing) {
      return interaction.editReply({
        content: `\`${displayName}\` is already on the leaderboard.`,
      });
    }

    await flexPlayersModel.create({
      summonerId: puuid,
      name: displayName,
    });

    await interaction.editReply({
      content: `Added \`${displayName}#${tagLine}\` to the leaderboard.`,
    });
  },
};
