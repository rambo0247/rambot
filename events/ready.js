const { Client } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();
const CurrencySystem = require('currency-system');

module.exports = {
  name: 'ready',
  once: true,
  /**
   *
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(client, currencySystem) {
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

    CurrencySystem.cs.on('debug', (debug, error) => {
      console.log(debug);
      if (error) console.error(error);
    });
    currencySystem.setMongoURL(process.env.MONGODB_TOKEN);
    currencySystem.setDefaultBankAmount(500);
    currencySystem.setDefaultWalletAmount(0);
    // 0 means infinite
    currencySystem.setMaxBankAmount(0);
    currencySystem.setMaxWalletAmount(0);

    currencySystem.searchForNewUpdate(true);
  },
};
