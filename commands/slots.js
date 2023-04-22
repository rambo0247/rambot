const {
  CommandInteraction,
  MessageEmbed,
  MessageAttachment,
  Client,
} = require('discord.js');
const { slots } = require('../validation/EmojiCodes');
const { getUserBalance } = require('../utils/currency-system-utils');
const { randomInArray } = require('../utils/util');
const CurrencySystem = require('currency-system');
const {
  sendGameEndMessage,
  updateUserBalance,
} = require('../utils/slots-utils');
const playerIds = new Set();

module.exports = {
  name: 'slots',
  description: 'Play a game of slots',
  options: [
    {
      name: 'coins',
      description: 'Play a game of slots betting the specified amount',
      type: 1,
      options: [
        {
          name: 'bet',
          description: 'Amount of money to bet (minimum: 50)',
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: 'all',
      description: 'Play a game of slots betting all your money',
      type: 1,
    },
  ],
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    const subCommand = interaction.options.getSubcommand();
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const userBalance = await getUserBalance(currencySystem, user, guildId);
    let betAmount;
    if (subCommand === 'coins')
      betAmount = interaction.options.getInteger('bet');
    else if (subCommand === 'all') {
      betAmount = userBalance.wallet;
    }
    if (playerIds.has(user.id)) {
      return await interaction.reply({
        content: 'A slots game is already running',
        ephemeral: true,
      });
    }
    if (betAmount < 50) {
      return await interaction.reply({
        content: 'Please enter a valid bet amount, minimum is 50',
        ephemeral: true,
      });
    }
    if (userBalance.wallet < betAmount) {
      return await interaction.reply({
        content: 'You do not have enough money in your wallet for this bet',
        ephemeral: true,
      });
    }
    playerIds.add(user.id);
    const pairWinMultiplier = 3;
    const tripleWinMultiplier = 12;
    const animatedSlots = slots.animatedSlots;
    const slotEmojis = [
      slots.seven,
      slots.apple,
      slots.cherry,
      slots.crown,
      slots.dollarSign,
      slots.lemon,
      slots.watermelon,
    ];
    const slotOne = randomInArray(slotEmojis);
    const slotTwo = randomInArray(slotEmojis);
    const slotThree = randomInArray(slotEmojis);
    const cyclingSlotsMsg = `${animatedSlots} ${animatedSlots} ${animatedSlots}`;
    const oneSlotLockedMsg = `${slotOne} ${animatedSlots} ${animatedSlots}`;
    const twoSlotsLockedMsg = `${slotOne} ${slotTwo} ${animatedSlots}`;
    const threeSlotsLockedMsg = `${slotOne} ${slotTwo} ${slotThree}`;
    const loseIcon = new MessageAttachment(
      './assets/slots/lose-icon.png',
      'lose-icon.png'
    );
    const pairWinIcon = new MessageAttachment(
      './assets/slots/win-pair.png',
      'win-pair.png'
    );
    const jackpotWinIcon = new MessageAttachment(
      './assets/slots/jackpot.png',
      'jackpot.png'
    );

    await interaction.deferReply();
    await interaction.followUp({
      content: cyclingSlotsMsg,
    });

    setTimeout(async () => {
      await interaction.editReply({
        content: oneSlotLockedMsg,
      });
    }, 1000 * 1);
    setTimeout(async () => {
      await interaction.editReply({
        content: twoSlotsLockedMsg,
      });
    }, 1000 * 3);
    setTimeout(async () => {
      await interaction.editReply({
        content: threeSlotsLockedMsg,
      });
      playerIds.delete(user.id);
    }, 1000 * 5);

    const gameEndEmbed = new MessageEmbed()
      .setTitle(':slot_machine: SLOTS :slot_machine:')
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })
      .setDescription(threeSlotsLockedMsg)
      .setColor('GREEN');

    if (slotTwo !== slotOne && slotTwo !== slotThree) {
      const messageField = {
        name: 'Loser',
        value: 'You lost',
      };
      const payout = betAmount;
      const result = await updateUserBalance(
        currencySystem,
        payout,
        user,
        guildId,
        'wallet',
        false
      );
      gameEndEmbed.setColor('RED');
      sendGameEndMessage(
        payout,
        loseIcon,
        gameEndEmbed,
        interaction,
        messageField,
        result
      );
    } else if (slotOne === slotTwo && slotOne === slotThree) {
      const messageField = {
        name: 'Jackpot',
        value: 'You won',
      };
      const payout = betAmount * tripleWinMultiplier;
      const result = await updateUserBalance(
        currencySystem,
        payout,
        user,
        guildId,
        'wallet',
        true
      );
      sendGameEndMessage(
        payout,
        jackpotWinIcon,
        gameEndEmbed,
        interaction,
        messageField,
        result
      );
    } else {
      const messageField = {
        name: 'Pair',
        value: 'You won',
      };
      const payout = betAmount * pairWinMultiplier;
      const result = await updateUserBalance(
        currencySystem,
        payout,
        user,
        guildId,
        'wallet',
        true
      );
      sendGameEndMessage(
        payout,
        pairWinIcon,
        gameEndEmbed,
        interaction,
        messageField,
        result
      );
    }
  },
};
