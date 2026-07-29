const flexPlayersModel = require("../models/players.js");

function convertToElo(league, division, LP = 0) {
  if (!league || !division) return;
  let baseElo = 0;
  let modifierPerLP = 0.7;
  let totalLP = LP;
  switch (league.toUpperCase()) {
    case "BRONZE":
      baseElo = 800;
      break;
    default:
    case "SILVER":
      baseElo = 1150;
      break;
    case "GOLD":
      baseElo = 1500;
      break;
    case "PLATINUM":
      baseElo = 1850;
      break;
    case "EMERALD":
      baseElo = 2200;
      break;
    case "DIAMOND":
      baseElo = 2550;
      break;
    case "MASTER":
      baseElo = 2900;
      modifierPerLP = 0.05;
      break;
    case "GRANDMASTER":
      baseElo = 3075;
      modifierPerLP = 0.05;
      break;
    case "CHALLENGER":
      baseElo = 3250;
      modifierPerLP = 0.05;
      break;
  }

  if (
    league !== "MASTER" &&
    league !== "GRANDMASTER" &&
    league !== "CHALLENGER"
  ) {
    switch (division) {
      case 1:
      case "I":
        totalLP += 100;
      case 2:
      case "II":
        totalLP += 100;
      case 3:
      case "III":
        totalLP += 100;
      case 4:
      case "IV":
        totalLP += 100;
      case "V":
      case 5:
        break;
    }
  }
  return baseElo + totalLP * modifierPerLP;
}

async function fetchPlayerData({ name, summonerId }, queueType) {
  let league;
  try {
    const leagueResponse = await fetch(
      `https://na1.api.riotgames.com/lol/league/v4/entries/by-puuid/${summonerId}`,
      {
        method: "GET",
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY,
        },
      },
    );
    if (!leagueResponse.ok) {
      console.error(
        `Failed to fetch ranked data for ${name}: ${leagueResponse.status}`,
      );
      return null;
    }
    league = await leagueResponse.json();
  } catch (error) {
    console.error(`Failed to fetch ranked data for ${name}:`, error);
    return null;
  }
  if (!Array.isArray(league)) {
    console.error(`Unexpected ranked data for ${name}:`, league);
    return null;
  }
  const data = league.find((queue) => queue.queueType === queueType);
  return {
    name,
    tier: data?.tier || "UNRANKED",
    rank: data?.rank || "",
    lp: data?.leaguePoints || "-",
    wins: data?.wins || "",
    losses: data?.losses || "",
    rankPosition:
      convertToElo(data?.tier, data?.rank, data?.leaguePoints) || "",
  };
}

async function getSortedRankedPlayers(queueType) {
  const flexPlayers = await flexPlayersModel.find().lean();
  const playerData = await Promise.all(
    flexPlayers.map((player) => fetchPlayerData(player, queueType)),
  );
  return playerData
    .filter((player) => player !== null)
    .sort((a, b) => b.rankPosition - a.rankPosition);
}

module.exports = {
  convertToElo,
  fetchPlayerData,
  getSortedRankedPlayers,
};
