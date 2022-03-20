const { randomInArray } = require('../utils/util');

module.exports = class Deck {
  constructor(cards) {
    this.cards = cards;
  }

  drawCards(drawAmount) {
    const drawnCards = [];
    for (let i = 0; i < drawAmount; i++) {
      const cards = this.cards;
      const card = randomInArray(cards);
      const index = cards.indexOf(card);
      cards.splice(index, 1);
      drawnCards.push(card);
    }
    return drawnCards;
  }
};
