const { CommandInteraction } = require('discord.js');
const questions = require('../utils/question-generator');
const { randomInArray } = require('../utils/util');
module.exports = {
  name: 'trivia',
  description: 'Starts a game of trivia',
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
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
      currentQuestion = await randomInArray(questions)();
      currentAnswer = currentQuestion.answer.toLowerCase();
      console.log(currentAnswer);
      await currentQuestion.sendQuestionMessage(interaction);
      timer = setTimeout(async () => {
        await currentQuestion.sendWrongAnswerMessage(interaction);
        await startQuestion();
      }, 1000 * secondsToAnswer);
    }

    messageCollector.on('collect', async (collectedMessage) => {
      const userInput = collectedMessage.content.toLowerCase();
      if (userInput === currentAnswer && !currentQuestion.isExpired) {
        clearTimeout(timer);
        await currentQuestion.sendCorrectAnswerMessage(
          interaction,
          collectedMessage.author.username
        );
        await startQuestion();
      }
    });

    messageCollector.on('end', async (collectedMessages) => {
      clearTimeout(timer);
      await interaction.channel.send(
        `Too many unanswered questions. Ending trivia game`
      );
    });
  },
};
