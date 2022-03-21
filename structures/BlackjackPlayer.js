module.exports = class BlackjackPlayer {
  constructor(deck) {
    this.cards = [];
    this.deck = deck;
    this.score = 0;
  }

  hit() {
    this.cards.push(...this.deck.drawCards(1));
    this.checkScore();
    if (this.score > 21) return 1;
    return 0;
  }

  deal() {
    this.cards.push(...this.deck.drawCards(2));
    this.checkScore();
    if (this.score === 21) return 1;
    return 0;
  }

  checkScore() {
    this.score = 0;
    let acesCount = 0;
    for (const card of this.cards) {
      if (card.name.includes('ace')) acesCount++;
      this.score += card.value;
    }

    while (this.score > 21 && acesCount !== 0) {
      acesCount--;
      this.score -= 10;
    }

    return this.score;
  }

  getCardEmojiIds() {
    const emojiIds = [];
    for (const card of this.cards) {
      emojiIds.push(card.emojiId);
    }
    return emojiIds;
  }
};
