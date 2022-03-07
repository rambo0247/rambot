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
async function skinFromImage() {
  const allChampionData = await getChampionsList();
  const randomChampion = randomInArray(allChampionData);
  const championSkinUrls = await getChampionSkins(randomChampion.id);
  championSkinUrls.shift();
  const randomSkin = randomInArray(championSkinUrls);
  const skinUrl = randomSkin[0];
  const skinName = randomSkin[1];

  return new Question(
    "Which skin's loading screen art is this: ",
    null,
    skinUrl,
    skinName,
    20
  );
}

async function championFromLore() {
  const allChampionData = await getChampionsList();
  const randomChampion = randomInArray(allChampionData);
  const championData = await getChampionData(randomChampion.id);
  let lore = championData.lore;
  const regEx = new RegExp(championData.name, 'ig');
  lore = lore.replaceAll(regEx, ' ----- ');

  return new Question(
    "Which champion's lore is this?",
    lore,
    null,
    championData.name,
    15
  );
}

module.exports = [
  runeFromDescription,
  champFromAbility,
  skinFromImage,
  championFromLore,
];
