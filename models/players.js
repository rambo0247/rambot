const mongoose = require('mongoose');

const flexPlayersSchema = mongoose.Schema({
  name: String,
  tagLine: String,
});

module.exports = mongoose.model('flex-players', flexPlayersSchema);
