const {
  getChampionsList,
  getChampionData,
  getChampionSkinsData,
  getChampionSkins,
  getChampionSpells,
  getChampionSpellImages,
  getAllItemsData,
  getItemData,
  getItemIconUrl,
  getItemBuildComponents,
  getAllRunesData,
  getRuneData,
  getRuneIconUrl,
} = require('./galeforce-utils');
const { parse, randomInArray } = require('./util');
const Question = require('../structures/Question');

async function runeFromDescription() {
  const allRunes = await getAllRunesData();
  const randomRune = randomInArray(allRunes);
  let runeDescription = parse(randomRune.longDesc);
  const regEx = new RegExp(randomRune.name, 'ig');
  runeDescription = runeDescription.replaceAll(regEx, ' ----- ');
  return new Question(
    'Which rune has this description: ',
    runeDescription,
    null,
    randomRune.name,
    5
  );
}
async function champFromAbility() {
  const allChampionData = await getChampionsList();
  const randomChampion = randomInArray(allChampionData);
  const championSpells = await getChampionSpells(randomChampion.id);
  championSpells.shift();
  const randomSpell = randomInArray(championSpells);
  return new Question(
    'Which champion has an ability called: ',
    randomSpell.name,
    null,
    randomChampion.name,
    15
  );
}

module.exports = [runeFromDescription, champFromAbility];
