const { rCoin } = require('../validation/EmojiCodes');
const { addMoney, removeMoney } = require('../utils/currency-system-utils');

module.exports = {
  sendGameEndMessage(
    payout,
    gameEndIcon,
    gameEndEmbed,
    interaction,
    messageField,
    userData
  ) {
    setTimeout(async () => {
      gameEndEmbed
        .addField(
          `${messageField.name}`,
          `${
            messageField.value
          } ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`
        )
        .setThumbnail(`attachment://${gameEndIcon.name}`);
      await interaction.editReply({
        content: '\u200B',
        embeds: [gameEndEmbed],
        files: [gameEndIcon],
      });
    }, 1000 * 5);
  },
  async updateUserBalance(
    currencySystem,
    payout,
    user,
    guildId,
    location,
    isWin
  ) {
    let result;
    if (isWin) {
      result = await addMoney(currencySystem, payout, user, guildId, location);
    } else {
      result = await removeMoney(
        currencySystem,
        payout,
        user,
        guildId,
        location
      );
    }
    return result;
  },
};
