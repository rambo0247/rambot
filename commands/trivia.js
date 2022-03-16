const { CommandInteraction } = require('discord.js');
const questions = require('../utils/question-generator');
const { randomInArray } = require('../utils/util');
const { saveToDatabase } = require('../utils/trivia-utils');
let isTriviaGameRunning = false;
const CurrencySystem = require('currency-system');
module.exports = {
  name: 'trivia',
  description: 'Starts a game of trivia',
  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   * @param {CurrencySystem} currencySystem
   */
  async execute(interaction, client, currencySystem) {
    if (isTriviaGameRunning) {
      await interaction.reply({
        content: 'There is already an on-going trivia game!',
        ephemeral: true,
      });
      return;
    }
    isTriviaGameRunning = true;
    await interaction.reply('Starting a game of trivia...');
    let currentQuestion, timer, currentAnswer;
    const secondsToAnswer = 12;
    const idleSeconds = 40;
    startQuestion();

    const messageCollector = interaction.channel.createMessageCollector({
      filter: (collectedMessage) => !collectedMessage.author.bot,
      idle: 1000 * idleSeconds,
    });

    async function startQuestion() {
      if (!isTriviaGameRunning) return;
      currentQuestion = await randomInArray(await questions)();
      currentAnswer = currentQuestion.answer.toLowerCase();
      await currentQuestion.sendQuestionMessage(interaction);
      timer = setTimeout(async () => {
        await currentQuestion.sendWrongAnswerMessage(interaction);
        await startQuestion();
      }, 1000 * secondsToAnswer);
    }

    messageCollector.on('collect', async (collectedMessage) => {
      const userInput = collectedMessage.content.toLowerCase();
      if (userInput === currentAnswer && !currentQuestion.isExpired) {
        await currentQuestion.sendCorrectAnswerMessage(
          interaction,
          collectedMessage.author.username
        );
        clearTimeout(timer);
        const gameData = {
          discordId: collectedMessage.author.id,
          userName: collectedMessage.author.username,
          points: currentQuestion.points,
        };
        await saveToDatabase(gameData, currencySystem, interaction);
        await startQuestion();
      }
    });

    messageCollector.on('end', async (collectedMessages) => {
      clearTimeout(timer);
      isTriviaGameRunning = false;
      await interaction.channel.send(
        `Too many unanswered questions. Ending trivia game`
      );
    });
  },
};
