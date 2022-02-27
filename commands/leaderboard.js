const { CommandInteraction, MessageEmbed } = require('discord.js');
const schema = require('../models/leaderboard');
const { paginator } = require('../utils/paginator');
const Ascii = require('ascii-table');
const userIds = new Set();
module.exports = {
  name: 'leaderboard-wordle',
  description: 'Displays wordle leaderboard',
  options: [
    {
      name: 'target',
      description: 'Select a user to see their wordle stats',
      type: 'USER',
      required: false,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const userId = interaction.user.id;
    if (userIds.has(userId)) {
      await interaction.reply(
        'Leaderboard is still up, wait until buttons are disabled to use command again'
      );
      return;
    }
    const target = interaction.options.getMember('target');
    const pages = [];
    let pageMsg = '';
    const usersData = await schema.find().sort({ ramboPoints: -1 });

    if (target) {
      const Table = new Ascii('Wordle Leaderboard');
      Table.setHeading(
        'Rank',
        'Rambo Points',
        'Username',
        'W/L',
        'Avg Guesses',
        'Invalid words'
      );
      for (const [
        index,
        {
          discordId,
          userName,
          ramboPoints,
          totalGames,
          totalGuesses,
          totalWins,
          totalLosses,
          totalInvalidWords,
        },
      ] of usersData.entries()) {
        if (discordId === target.user.id) {
          Table.addRow(
            `${index + 1}`,
            `${ramboPoints}`,
            `${userName}`,
            `${totalWins}/${totalLosses} (${Math.round(
              (totalWins / totalGames) * 100
            )}%)`,
            `${(totalGuesses / totalGames).toFixed(2)}`,
            `${totalInvalidWords}`
          );
          Table.removeBorder();
          Table.setBorder('|', '_', '.', '|');
          for (let column = 0; column < 6; column++) {
            Table.setAlign(column, Table.__nameAlign);
          }
          pageMsg = Table.toString();
          pages.push(pageMsg);
        }
      }
    } else {
      let playersPerPage = 10;
      for (let index = 0; index < usersData.length; index += 10) {
        const currentPlayer = usersData.slice(index, playersPerPage);
        playersPerPage += 10;
        let rankNumber = index;
        const Table = new Ascii('Wordle Leaderboard');
        Table.setHeading(
          'Rank',
          'Rambo Points',
          'Username',
          'W/L',
          'Avg Guesses',
          'Invalid words'
        );
        for (const {
          userName,
          ramboPoints,
          totalGames,
          totalGuesses,
          totalWins,
          totalLosses,
          totalInvalidWords,
        } of currentPlayer) {
          Table.addRow(
            `${++rankNumber}`,
            `${ramboPoints}`,
            `${userName}`,
            `${totalWins}/${totalLosses} (${Math.round(
              (totalWins / totalGames) * 100
            )}%)`,
            `${(totalGuesses / totalGames).toFixed(2)}`,
            `${totalInvalidWords}`
          );
        }
        for (let column = 0; column < 6; column++) {
          Table.setAlign(column, Table.__nameAlign);
        }
        Table.removeBorder();
        Table.setBorder('|', '_', '.', '|');
        pageMsg = Table.toString();
        pages.push(pageMsg);
      }
    }

    userIds.add(userId);
    if (pages.length === 0) {
      await interaction.reply(
        `${target.user.username} has not played a game of wordle`
      );
    } else {
      paginator(interaction, pages);
    }

    if (target) {
      userIds.delete(userId);
    } else {
      setTimeout(() => {
        userIds.delete(userId);
      }, 1000 * 15);
    }
  },
};
