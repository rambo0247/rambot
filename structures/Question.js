const { MessageEmbed } = require('discord.js');

module.exports = class Question {
  constructor(title, description, imageUrl, answer, points) {
    this.title = title;
    this.description = description;
    this.imageUrl = imageUrl;
    this.answer = answer;
    this.points = points;
    this.isExpired = false;
  }

  async sendQuestionMessage(interaction) {
    const questionEmbed = new MessageEmbed()
      .setTitle(this.title)
      .setColor('RANDOM');

    if (this.description) questionEmbed.setDescription(this.description);
    else if (this.imageUrl) questionEmbed.setImage(this.imageUrl);
    await interaction.channel.send({ embeds: [questionEmbed] });
  }

  async sendWrongAnswerMessage(interaction) {
    this.isExpired = true;
    await interaction.channel.send(
      `Time's up, the correct answer was ${this.answer}`
    );
  }

  async sendCorrectAnswerMessage(interaction, username) {
    this.isExpired = true;
    await interaction.channel.send(
      `Correct answer **${this.answer}** by user: **${username}! +${this.points} Points**`
    );
  }
};
