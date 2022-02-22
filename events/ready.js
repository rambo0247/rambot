const { Client } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  name: 'ready',
  once: true,
  /**
   *
   * @param {Client} client
   */
  async execute(client) {
    console.log('The client is now ready!');

    if (!process.env.MONGODB_TOKEN) return;

    await mongoose
      .connect(process.env.MONGODB_TOKEN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Client is connected to the database');
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
