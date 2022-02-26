const { CommandInteraction, MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');
const {
  getAnswerWord,
  isWordGuessable,
  colorLetters,
  saveToDatabase,
  getGameEndField,
} = require('../utils/wordle-utils');
const delay = require('util').promisify(setTimeout);
const playerIds = [];
module.exports = {
  name: 'wordle',
  description: 'Plays a game of wordle',
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const discordId = interaction.user.id;
    if (playerIds.includes(discordId)) {
      return await interaction.reply({
        content: 'You already started a game ape',
        ephemeral: true,
      });
    }
    playerIds.push(discordId);
    const answerWord = getAnswerWord();
    let guessCount = 0;
    const userName = interaction.user.username;
    let ramboPoints = -20;
    let isWin;
    let invalidWordCount = 0;

    const wordleEmbed = new MessageEmbed()
      .setColor('#6dcb00')
      .setTitle('Wordle')
      .setAuthor({
        name: `${userName}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })
      .setDescription(
        stripIndent`
         ◻️◻️◻️◻️◻️
         ◻️◻️◻️◻️◻️
         ◻️◻️◻️◻️◻️
         ◻️◻️◻️◻️◻️
         ◻️◻️◻️◻️◻️
         ◻️◻️◻️◻️◻️
        `
      )
      .setThumbnail('attachment://100s.png')
      .setFooter({
        text: stripIndent`
        To play, use the command /wordle
        Guess by typing a five letter word.
        `,
      });

    await interaction.reply({
      embeds: [wordleEmbed],
      files: [{ attachment: './assets/images/100s.png', name: '100s.png' }],
    });

    let secondsRemaining = 100;
    const timer = setInterval(async () => {
      if ((secondsRemaining -= 10) % 10 === 0) {
        wordleEmbed.setThumbnail(`attachment://${secondsRemaining}s.png`);
        await interaction.editReply({
          embeds: [wordleEmbed],
          files: [
            {
              attachment: `./assets/images/${secondsRemaining}s.png`,
              name: `${secondsRemaining}s.png`,
            },
          ],
        });
      }
      if (secondsRemaining === 0) {
        clearInterval(timer);
      }
    }, 1000 * 10);

    const messageCollector = interaction.channel.createMessageCollector({
      filter: (collectedMessage) => discordId === collectedMessage.author.id,
      time: 1000 * 101,
    });

    messageCollector.on('collect', async (collectedMessage) => {
      const userInput = collectedMessage.content.toLowerCase();
      if (!isWordGuessable(userInput)) {
        invalidWordCount += 1;
        await interaction.followUp({
          content: `Please enter a valid guess`,
          ephemeral: true,
        });
        // avoid visual bug (messages not being deleted)
        await delay(100);
        await collectedMessage.delete();
        return;
      }
      // avoid visual bug (messages not being deleted)
      await delay(100);
      await collectedMessage.delete();
      const emojis = colorLetters(userInput, answerWord);
      const newDescription = wordleEmbed.description.replace(
        '◻️◻️◻️◻️◻️',
        emojis
      );
      wordleEmbed.setDescription(newDescription);

      await interaction.editReply({ embeds: [wordleEmbed] });
      guessCount++;
      if (guessCount === 6 || userInput === answerWord) messageCollector.stop();
    });

    messageCollector.on('end', async (collectedMessages) => {
      if (
        collectedMessages.some(
          (word) => word.content.toLowerCase() === answerWord
        )
      ) {
        isWin = true;
        ramboPoints = (6 - guessCount + 1) * 10;
        const field = getGameEndField(guessCount, ramboPoints, answerWord);
        wordleEmbed.addField(
          `${field.fieldName}`,
          `${field.fieldValue}`,
          false
        );
        await interaction.editReply({ embeds: [wordleEmbed] });
      } else {
        const field = getGameEndField(guessCount, ramboPoints, answerWord);
        wordleEmbed.addField(`${field.fieldName}`, `${field.fieldValue}`, true);
        isWin = false;
        await interaction.editReply({ embeds: [wordleEmbed] });
      }
      clearInterval(timer);
      const gameData = {
        userName,
        discordId,
        isWin,
        ramboPoints,
        guessCount,
        invalidWordCount,
      };
      saveToDatabase(gameData);
      playerIds.splice(playerIds.indexOf(discordId), 1);
    });
  },
};
