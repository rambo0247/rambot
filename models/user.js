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

const wordleSchema = mongoose.Schema({
  score: def,
  totalGames: def,
  totalGuesses: def,
  totalWins: def,
  totalLosses: def,
  totalInvalidWords: def,
});

const triviaSchema = mongoose.Schema({
  score: def,
  totalCorrectAnswers: def,
});

const userSchema = mongoose.Schema({
  discordId: def2,
  wordleStats: wordleSchema,
  triviaStats: triviaSchema,
});

module.exports = mongoose.model('user', userSchema);
