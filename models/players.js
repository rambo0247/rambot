const mongoose = require('mongoose');

const flexPlayersSchema = mongoose.Schema({
  summonerId: String,
  name: String,
});

module.exports = mongoose.model('flex-players', flexPlayersSchema);
