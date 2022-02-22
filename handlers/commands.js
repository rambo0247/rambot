const { Client } = require('discord.js');
const { Perms } = require('../validation/permissions');
const Ascii = require('ascii-table');
const fs = require('fs');

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  const Table = new Ascii('Command Loaded');
  const commandsArray = [];
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

    client.commands.set(command.name, command);
    commandsArray.push(command);

    Table.addRow(command.name, '🟢SUCCESSFUL');
  }

  console.log(Table.toString());

  client.once('ready', async () => {
    client.guilds.cache.forEach((guild) => {
      guild.commands.set(commandsArray).then(async (command) => {
        const Roles = (commandName) => {
          const cmdPerms = commandsArray.find(
            (c) => c.name === commandName
          ).permissions;
          if (!cmdPerms) return null;
          return guild.roles.cache.filter((r) => r.permissions.has(cmdPerms));
        };

        const fullPermissions = command.reduce(
          (accumulator, serverAppCommand) => {
            const roles = Roles(serverAppCommand.name);
            if (!roles) return accumulator;

            const permissions = roles.reduce((serverPermInfo, role) => {
              return [
                ...serverPermInfo,
                { id: role.id, type: 'ROLE', permission: true },
              ];
            }, []);
            return [...accumulator, { id: serverAppCommand.id, permissions }];
          },
          []
        );
        await guild.commands.permissions.set({ fullPermissions });
      });
    });
  });
};
