const htmlparser2 = require('htmlparser2');

module.exports = {
  parse(unparsedText) {
    let parsedText = '';
    const parser1 = new htmlparser2.Parser({
      ontext(text) {
        parsedText += text;
      },
      onclosetag(tagname) {
        if (tagname === 'br') {
          parsedText += `\n`;
        }
      },
    });

    parser1.write(unparsedText);
    parser1.end();

    return parsedText;
  },
  randomInArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
  censorText(stringToCensor, text) {
    const regEx = new RegExp(stringToCensor, 'ig');
    text = text.replaceAll(regEx, ' ----- ');
    return text;
  },
};
