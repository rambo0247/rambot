const {
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  CommandInteraction,
} = require('discord.js');
const { leagueRanks } = require('../validation/EmojiCodes');
const { getSortedRankedPlayers } = require('./ranked-players');

const PLAYERS_PER_PAGE = 10;
const COLLECTOR_TIME_MS = 1000 * 60;

const PLACE_EMOJIS = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
  4: '4️⃣',
  5: '5️⃣',
  6: '6️⃣',
  7: '7️⃣',
  8: '8️⃣',
  9: '9️⃣',
  10: '🔟',
};

function getPlaceMarker(position) {
  if (PLACE_EMOJIS[position]) return PLACE_EMOJIS[position];
  return `**${position}.**`;
}

function getCrestEmoji(tier) {
  const key = (tier || 'UNRANKED').toUpperCase();
  return leagueRanks[key] || leagueRanks.UNRANKED;
}

function formatRow(player, position) {
  const place = getPlaceMarker(position);
  const crest = getCrestEmoji(player.tier);
  const tierText = player.rank
    ? `${player.tier} ${player.rank}`
    : player.tier || 'UNRANKED';
  const lpText = player.rank ? `${player.lp} LP` : '-';
  const wlText = player.rank
    ? `${player.wins}/${player.losses} (${Math.round(
        (player.wins / (player.wins + player.losses)) * 100
      )}%)`
    : '-';

  return `${place} ${crest} ${tierText}  **${player.name}**  ${lpText}  ${wlText}`;
}

function buildEmbedPages(players, title) {
  const pages = [];
  const totalPages = Math.max(1, Math.ceil(players.length / PLAYERS_PER_PAGE));

  for (let page = 0; page < totalPages; page++) {
    const start = page * PLAYERS_PER_PAGE;
    const slice = players.slice(start, start + PLAYERS_PER_PAGE);
    const description =
      slice.length > 0
        ? slice
            .map((player, index) => formatRow(player, start + index + 1))
            .join('\n')
        : 'No players found.';

    pages.push(
      new MessageEmbed()
        .setTitle(title)
        .setColor('DARK_BLUE')
        .setDescription(description)
        .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
    );
  }

  return pages;
}

/**
 *
 * @param {CommandInteraction} interaction
 * @param {import('discord.js').MessageEmbed[]} pages
 */
async function paginateRankedEmbeds(interaction, pages) {
  if (!interaction) throw new Error('Provide interaction');
  if (!pages || pages.length === 0) throw new Error('Provide pages');

  let pageNumber = 0;
  const prevButton = new MessageButton()
    .setCustomId('ranked-prev')
    .setStyle('PRIMARY')
    .setEmoji('⬅');
  const nextButton = new MessageButton()
    .setCustomId('ranked-next')
    .setStyle('PRIMARY')
    .setEmoji('▶');
  const row = new MessageActionRow().addComponents([prevButton, nextButton]);

  const disabledPrevButton = new MessageButton()
    .setCustomId('ranked-prev-disabled')
    .setStyle('PRIMARY')
    .setEmoji('⬅')
    .setDisabled();
  const disabledNextButton = new MessageButton()
    .setCustomId('ranked-next-disabled')
    .setStyle('PRIMARY')
    .setEmoji('▶')
    .setDisabled();
  const disabledRow = new MessageActionRow().addComponents([
    disabledPrevButton,
    disabledNextButton,
  ]);

  await interaction.editReply({
    embeds: [pages[0]],
    components: pages.length === 1 ? [disabledRow] : [row],
  });

  if (pages.length === 1) return;

  const collector = interaction.channel.createMessageComponentCollector({
    filter: (msg) =>
      msg.user.id === interaction.user.id &&
      (msg.customId === 'ranked-prev' || msg.customId === 'ranked-next'),
    time: COLLECTOR_TIME_MS,
  });

  collector.on('collect', async (button) => {
    await button.deferUpdate();
    if (button.customId === 'ranked-next') {
      pageNumber = pageNumber + 1 < pages.length ? pageNumber + 1 : 0;
    } else if (button.customId === 'ranked-prev') {
      pageNumber = pageNumber > 0 ? pageNumber - 1 : pages.length - 1;
    }
    await interaction.editReply({
      embeds: [pages[pageNumber]],
      components: [row],
    });
  });

  collector.on('end', async () => {
    await interaction
      .editReply({
        embeds: [pages[pageNumber]],
        components: [disabledRow],
      })
      .catch(() => null);
  });
}

/**
 * Fetch + render a paginated ranked leaderboard embed.
 *
 * @param {CommandInteraction} interaction
 * @param {{ queueType: string, title: string }} options
 */
async function showRankedLeaderboard(interaction, { queueType, title }) {
  await interaction.deferReply();

  const sortedPlayers = await getSortedRankedPlayers(queueType);
  if (sortedPlayers.length === 0) {
    return interaction.editReply({
      content: 'Could not fetch ranked data for any players.',
    });
  }

  const pages = buildEmbedPages(sortedPlayers, title);
  await paginateRankedEmbeds(interaction, pages);
}

module.exports = {
  PLAYERS_PER_PAGE,
  buildEmbedPages,
  paginateRankedEmbeds,
  showRankedLeaderboard,
  formatRow,
  getPlaceMarker,
  getCrestEmoji,
};
