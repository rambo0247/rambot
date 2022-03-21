const {
  CommandInteraction,
  Client,
  MessageButton,
  MessageActionRow,
  MessageEmbed,
} = require('discord.js');
const CurrencySystem = require('currency-system');
const { rCoin } = require('../validation/EmojiCodes');
const {
  getUserBalance,
  addMoney,
  removeMoney,
} = require('../utils/currency-system-utils');
const Blackjack = require('../structures/Blackjack');
const BlackjackPlayer = require('../structures/BlackjackPlayer');
const Deck = require('../structures/Deck');
const { initializeCards } = require('../utils/blackjack-utils');

module.exports = {
  name: 'blackjack',
  description: 'Play a game of blackjack',
  options: [
    {
      name: 'bet',
      description: 'Amount of money to bet (minimum: 50)',
      type: 'INTEGER',
      required: true,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const betAmount = interaction.options.getInteger('bet');
    const userBalance = await getUserBalance(currencySystem, user, guildId);
    const hitButton = new MessageButton()
      .setCustomId('hit')
      .setStyle('PRIMARY')
      .setLabel('Hit')
      .setEmoji('🎯');
    const standButton = new MessageButton()
      .setCustomId('stand')
      .setStyle('PRIMARY')
      .setLabel('Stand')
      .setEmoji('🛑');
    const buttonsrow = new MessageActionRow().addComponents([
      hitButton,
      standButton,
    ]);
    const collector = interaction.channel.createMessageComponentCollector({
      filter: (msg) => msg.user.id === interaction.user.id,
      time: 1000 * 60,
    });
    const deck = new Deck(initializeCards());
    const player = new BlackjackPlayer(deck);
    const dealer = new BlackjackPlayer(deck);
    const blackjack = new Blackjack(deck, player, dealer);
    if (betAmount < 50) {
      return await interaction.reply({
        content: 'Please enter a valid bet amount, minimum is 50',
        ephemeral: true,
      });
    }
    if (userBalance.wallet.toLocaleString() < betAmount) {
      return await interaction.reply({
        content: 'You do not have enough money in your wallet for this bet',
        ephemeral: true,
      });
    }
    const blackjackEmbed = new MessageEmbed()
      .setTitle('Blackjack')
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })
      .setThumbnail('attachment://blackjack.png')
      .setFooter({ text: 'Blackjack - © Rambo Incorporated ' });

    let gameOverCondition = await blackjack.play(
      interaction,
      buttonsrow,
      blackjackEmbed
    );

    collector.on('collect', async (button) => {
      await button.deferUpdate();
      if (button.customId === 'hit') {
        if (player.hit() === 1) {
          gameOverCondition = 'player-bust';
          collector.stop();
        } else if (player.checkScore() === 21) {
          gameOverCondition = 'player-blackjack';
          collector.stop();
        } else {
          await blackjack.displayEmbed(blackjackEmbed, interaction, buttonsrow);
        }
      } else if (button.customId === 'stand') {
        gameOverCondition = 'player-stand';
        collector.stop();
      }
    });

    collector.on('end', async () => {
      let embedDescription;
      let payout = betAmount;
      let userData;
      switch (gameOverCondition) {
        case 'player-blackjack':
          payout *= 1.5;
          userData = await addMoney(
            currencySystem,
            payout,
            user,
            guildId,
            'wallet'
          );
          embedDescription = `**Blackjack!**\nYou won ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`;
          break;
        case 'player-bust':
          userData = await removeMoney(
            currencySystem,
            payout,
            user,
            guildId,
            'wallet'
          );
          embedDescription = `**Bust!**\nYou lost ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`;
          break;
        case 'player-dealer-blackjack':
          embedDescription`**Two blackjacks, Tied!**\nYou lost 0 ${rCoin}\nYou now have ${userBalance.wallet} ${rCoin}`;
        case 'player-stand':
          while (dealer.checkScore() < 17) {
            if (dealer.hit() === 1) {
              userData = await addMoney(
                currencySystem,
                payout,
                user,
                guildId,
                'wallet'
              );
              embedDescription = `**Dealer Busted**\nYou won ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`;
            }
          }
        default:
          if (dealer.checkScore() === player.checkScore()) {
            embedDescription = `**Push**\nYou lost 0 ${rCoin}\nYou now have ${userBalance.wallet} ${rCoin}`;
          } else if (
            dealer.checkScore() > player.checkScore() &&
            dealer.checkScore() <= 21
          ) {
            userData = await removeMoney(
              currencySystem,
              payout,
              user,
              guildId,
              'wallet'
            );
            embedDescription = `**Dealer wins!!**\nYou lost ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`;
          } else if (dealer.checkScore() < player.checkScore()) {
            userData = await addMoney(
              currencySystem,
              payout,
              user,
              guildId,
              'wallet'
            );
            embedDescription = `**Winner**\nYou won ${payout} ${rCoin}\nYou now have ${userData.rawData.wallet.toLocaleString()} ${rCoin}`;
          }
      }
      await blackjack.displayEmbed(
        blackjackEmbed,
        interaction,
        buttonsrow,
        embedDescription
      );
    });

    if (
      gameOverCondition === 'player-blackjack' ||
      gameOverCondition === 'player-dealer-blackjack'
    ) {
      collector.stop();
    }
  },
};
