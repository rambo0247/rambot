const { parseSeconds } = require('./util');
module.exports = {
  async addMoney(currencySystem, moneyAmount, userId, guildId, location) {
    const result = await currencySystem.addMoney({
      user: userId,
      guild: guildId,
      amount: moneyAmount,
      wheretoPutMoney: location,
    });
    if (result.error) console.log('You cant add negative money');
    return result;
  },
  async removeMoney(currencySystem, moneyAmount, userId, guildId, location) {
    const result = await currencySystem.removeMoney({
      user: userId,
      guild: guildId,
      amount: moneyAmount,
      wheretoPutMoney: location,
    });
    if (result.error) console.log('You cant remove negitive money');
    return result;
  },
  async getUserBalance(currencySystem, user, guildId) {
    const balance = await currencySystem.balance({
      user: user,
      guild: guildId,
    });
    return balance;
  },
  async getUserCommandsCooldowns(currencySystem, interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const result = await currencySystem.info(userId, guildId);
    const data = await currencySystem.findUser({
      user: userId,
      guild: guildId,
    });
    const robCommandCooldown = 3600;
    const coinflipCommandCooldown = 60;
    const robTimeLeft = parseSeconds(
      robCommandCooldown - (Date.now() - data.lastRob) / 1000
    );
    const coinflipTimeLeft = parseSeconds(
      coinflipCommandCooldown - (Date.now() - data.lastGamble) / 1000
    );
    result.info.push(['Rob', { timeLeft: robTimeLeft }]);
    result.info.push(['Coinflip', { timeLeft: coinflipTimeLeft }]);
    let commandsCooldownInfo = '';
    const commandsToShow = {
      daily: 'Daily',
      weekly: 'Weekly',
      work: 'Work',
      rob: 'Rob',
      coinflip: 'Coinflip',
    };
    for (const [key, value] of result.info) {
      if (key.toLowerCase() in commandsToShow) {
        if (value.used || value.timeLeft == '0 Seconds') {
          commandsCooldownInfo += `**${key}** - ready\n`;
        } else {
          commandsCooldownInfo += `**${key}** - ${value.timeLeft}\n`;
        }
      }
    }
    return commandsCooldownInfo;
  },
};
