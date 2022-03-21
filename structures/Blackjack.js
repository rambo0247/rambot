module.exports = class Blackjack {
  constructor(deck, player, dealer) {
    this.deck = deck;
    this.player = player;
    this.dealer = dealer;
  }

  async play(interaction, buttonsrow, blackjackEmbed) {
    let gameOverCondition;
    const isPlayerWin = this.player.deal();
    const isDealerWin = this.dealer.deal();
    if (isPlayerWin) {
      gameOverCondition = 'player-blackjack';
      if (isDealerWin) gameOverCondition = 'player-dealer-blackjack';
    }

    await this.displayEmbed(blackjackEmbed, interaction, buttonsrow);
    return gameOverCondition;
  }

  async displayEmbed(
    blackjackEmbed,
    interaction,
    buttonsrow,
    description = ''
  ) {
    const playerCardEmojiIds = this.player.getCardEmojiIds();
    const dealerCardEmojiIds = this.dealer.getCardEmojiIds();
    const playerScore = this.player.checkScore();
    const dealerScore = this.dealer.checkScore();
    let embedDescription;
    if (description) {
      embedDescription = `**Your hand | ${playerScore}**\n${playerCardEmojiIds}\n**Dealer hand | ${dealerScore}**\n${dealerCardEmojiIds}\n${description}`;
    } else {
      dealerCardEmojiIds[1] = '<:cardback:955131437340819486>';
      embedDescription = `**Your hand | ${playerScore}**\n${playerCardEmojiIds}\n**Dealer hand | ${
        dealerScore - this.dealer.cards[1].value
      }**\n${dealerCardEmojiIds}`;
    }
    blackjackEmbed.setDescription(embedDescription.replaceAll(',', ''));
    if (!interaction.replied) {
      await interaction.reply({
        embeds: [blackjackEmbed],
        components: [buttonsrow],
      });
    } else {
      await interaction.editReply({
        embeds: [blackjackEmbed],
        components: [buttonsrow],
      });
    }
  }
};
