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
};
