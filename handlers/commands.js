const { Client } = require('discord.js');
const { Perms } = require('../validation/permissions');
const Ascii = require('ascii-table');
const fs = require('fs');

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  const Table = new Ascii('Command Loaded');
  const commandFiles = fs
    .readdirSync('./commands')
    .filter((f) => f.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);

    if (!command.name) {
      Table.addRow(file, '🔴Failed', 'Missing a name');
      break;
    }

    if (!command.context && !command.description) {
      Table.addRow(command.name, '🔴Failed', 'Missing a description');
      break;
    }

    if (command.permissions) {
      if (command.permissions.every((perm) => Perms.includes(perm))) {
        command.defaultPermission = false;
      } else {
        Table.addRow(command.name, '🔴Failed', 'Permissions are invalid');
        break;
      }
    }

    Table.addRow(command.name, '🟢SUCCESSFUL');
  }

  console.log(Table.toString());
};
