const mongoose = require('mongoose');

const def = {
  type: Number,
  require: true,
  default: 0,
};

const def2 = {
  type: String,
  require: true,
};

const schema = mongoose.Schema({
  discordId: def2,
  userName: def2,
  ramboPoints: def,
  totalGames: def,
  totalGuesses: def,
  totalWins: def,
  totalLosses: def,
  totalInvalidWords: def,
});

module.exports = mongoose.model('leaderboard', schema, 'leaderboard');
