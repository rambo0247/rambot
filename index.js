const { Client, Intents, Collection } = require('discord.js');
require('dotenv').config();
const CurrencySystem = require('currency-system');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.commands = new Collection();
const currencySystem = new CurrencySystem();
require('./handlers/commands')(client, currencySystem);
require('./handlers/events')(client, currencySystem);

client.login(process.env.DISCORD_TOKEN);
