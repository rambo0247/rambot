const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const fs = require('fs');

const commandsArray = [];
const commandFiles = fs
  .readdirSync('./commands')
  .filter((f) => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commandsArray.push(command);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

rest
  .put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commandsArray,
  })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
