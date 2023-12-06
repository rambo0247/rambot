const { CommandInteraction, Client } = require('discord.js');
const flexPlayersModel = require('../models/players.js');
const Ascii = require('ascii-table');
const { codeBlock } = require('@discordjs/builders');

module.exports = {
  name: 'flex',
  description: 'View Diversity Esports flex ranks',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    await interaction.deferReply();
    const flexPlayers = (await flexPlayersModel.find().lean())[0].players;
    const playerFlexData = [];
    for await (const player of flexPlayers) {
      const playerData = await fetchPlayerData(player);
      playerFlexData.push({
        ...playerData,
        rankPosition: convertToElo(
          playerData.name,
          playerData.tier,
          playerData.rank,
          playerData.lp
        ),
      });
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    const sortedFlexData = playerFlexData.sort(
      (a, b) => b.rankPosition - a.rankPosition
    );
    const Table = new Ascii('Flex Standings');
    Table.setHeading('Rank', 'Username', 'LP', 'W/L');
    for (let i = 1; i <= sortedFlexData.length; i++) {
      const { name, rank, tier, lp, wins, losses } = sortedFlexData[i - 1];
      Table.addRow(
        `${i}`,
        `${name}`,
        `${tier} ${rank} - ${lp}`,
        `${lp}`,
        `${wins}/${losses} (${Math.round((wins / (wins + losses)) * 100)}%)`
      );
    }
    for (let column = 0; column < 6; column++) {
      Table.setAlign(column, Table.__nameAlign);
    }
    Table.removeBorder();
    Table.setBorder('|', '_', '.', '|');
    const msg = Table.toString();
    await interaction.editReply({
      content: `${codeBlock('json', msg)}`,
    });
  },
};

function convertToElo(name, league, division, LP = 0) {
  let baseElo = 0;
  let modifierPerLP = 0.7;
  let totalLP = LP;
  switch (league.toUpperCase()) {
    case 'BRONZE':
      baseElo = 800;
      break;
    default:
    case 'SILVER':
      baseElo = 1150;
      break;
    case 'GOLD':
      baseElo = 1500;
      break;
    case 'PLATINUM':
      baseElo = 1850;
      break;
    case 'EMERALD':
      baseElo = 2200;
      break;
    case 'DIAMOND':
      baseElo = 2550;
      break;
    case 'MASTER':
      baseElo = 2900;
      modifierPerLP = 0.05;
      break;
    case 'CHALLENGER':
      baseElo = 3250;
      modifierPerLP = 0.05;
      break;
  }

  if (league !== 'MASTER' && league !== 'CHALLENGER') {
    switch (division) {
      case 1:
      case 'I':
        totalLP += 100;
      case 2:
      case 'II':
        totalLP += 100;
      case 3:
      case 'III':
        totalLP += 100;
      case 4:
      case 'IV':
        totalLP += 100;
      case 'V':
      case 5:
        break;
    }
  }
  return baseElo + totalLP * modifierPerLP;
}

async function fetchPlayerData({ name, tagLine }) {
  const accountResponse = await fetch(
    `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tagLine}`,
    {
      method: 'GET',
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY,
      },
    }
  );
  const account = await accountResponse.json();
  const playerUUID = account.puuid;
  const summonerResponse = await fetch(
    `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${playerUUID}`,
    {
      method: 'GET',
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY,
      },
    }
  );
  const summoner = await summonerResponse.json();
  const summonerId = summoner.id;
  const leagueResponse = await fetch(
    `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
    {
      method: 'GET',
      headers: {
        'X-Riot-Token': process.env.RIOT_API_KEY,
      },
    }
  );
  const league = await leagueResponse.json();
  const data = league.find((queue) => queue.queueType === 'RANKED_FLEX_SR');
  return {
    name: data.summonerName,
    tier: data.tier,
    rank: data.rank,
    lp: data.leaguePoints,
    wins: data.wins,
    losses: data.losses,
  };
}
