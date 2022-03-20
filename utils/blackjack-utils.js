const { cards } = require('../validation/EmojiCodes');

module.exports = {
  initializeCards() {
    const cardsArray = [];
    for (const card in cards) {
      let value = Number(cards[card].split(':')[1].split('_')[0]);
      if (value > 10) value = 10;
      if (value === 1) value = 11;
      cardsArray.push({
        name: card,
        value: value,
        emojiId: cards[card],
      });
    }
    return cardsArray;
  },
};
