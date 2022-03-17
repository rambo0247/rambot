const { rCoin } = require('../validation/EmojiCodes');

module.exports = {
  sendGameEndMessage(
    payout,
    gameEndIcon,
    gameEndEmbed,
    interaction,
    messageField,
    userBalance
  ) {
    setTimeout(async () => {
      gameEndEmbed
        .addField(
          `${messageField.name}`,
          `${
            messageField.value
          } ${payout} ${rCoin}\nYou now have ${userBalance.wallet.toLocaleString()} ${rCoin}`
        )
        .setThumbnail(`attachment://${gameEndIcon.name}`);
      await interaction.editReply({
        content: '\u200B',
        embeds: [gameEndEmbed],
        files: [gameEndIcon],
      });
    }, 1000 * 5);
  },
};
