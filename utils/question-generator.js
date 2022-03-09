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
const jimp = require('jimp');

const questionGenerator = (async function () {
  const allRunes = await getAllRunesData();
  const allChampionData = await getChampionsList();
  const allItemsData = await getAllItemsData();
  const spellKeys = {
    0: 'passive',
    1: 'Q',
    2: 'W',
    3: 'E',
    4: 'R',
  };
  const imageEffects = [
    (image) => image.posterize(2.5),
    (image) => image.blur(23),
    (image) => {
      image.invert();
      image.rotate(180);
    },
    (image) => {
      image.cover(300, 50);
    },
  ];

  function runeFromDescription() {
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
    const randomChampion = randomInArray(allChampionData);
    const championSpells = await getChampionSpells(randomChampion.id);
    championSpells.shift();
    const randomSpell = randomInArray(championSpells);
    return new Question(
      'Which champion has an ability called: ',
      randomSpell.name,
      null,
      randomChampion.name,
      5
    );
  }
  async function skinFromImage() {
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
      5
    );
  }

  async function championFromLore() {
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
      10
    );
  }

  function champFromTitle() {
    const randomChampion = randomInArray(allChampionData);
    const championTitle = randomChampion.title;

    return new Question(
      'Which champion has the title: ',
      championTitle,
      null,
      randomChampion.name,
      5
    );
  }

  function itemFromDescription() {
    const randomItem = randomInArray(allItemsData);
    const itemDescription = parse(randomItem.description);

    return new Question(
      'Which item has the following description: ',
      itemDescription,
      null,
      randomItem.name,
      5
    );
  }

  async function championFromSkins() {
    const randomChampion = randomInArray(allChampionData);
    const championSkinUrls = await getChampionSkins(randomChampion.id);
    championSkinUrls.shift();
    let skinNames = [];
    for (const skin of championSkinUrls) {
      skinNames.push(skin[1]);
    }
    skinNames = skinNames.join(', ');
    let regEx;
    if (skinNames.includes('Dr.')) {
      regEx = new RegExp(randomChampion.name.split('. ')[1], 'ig');
    } else {
      regEx = new RegExp(randomChampion.name, 'ig');
    }
    skinNames = skinNames.replaceAll(regEx, ' ----- ');
    return new Question(
      'Which champion has the following skins: ',
      skinNames,
      null,
      randomChampion.name,
      5
    );
  }

  async function abilityFromChamp() {
    const randomChampion = randomInArray(allChampionData);
    const championSpells = await getChampionSpells(randomChampion.id);
    const randomSpell = randomInArray(championSpells);
    const spellName = randomSpell.name;
    const spellKey = spellKeys[championSpells.indexOf(randomSpell)];
    return new Question(
      `What's the name of ${randomChampion.name}'s  ${spellKey}`,
      null,
      null,
      spellName,
      15
    );
  }

  async function itemFromComponents() {
    const allowedItemsData = allItemsData.filter((item) => item.from);
    const randomItem = randomInArray(allowedItemsData);
    const itemComponents = await getItemBuildComponents([
      randomItem.name.toLowerCase(),
    ]);
    const extraGoldCost = randomItem.gold.base;
    const itemComponentNames = [];
    for (const item of itemComponents) {
      itemComponentNames.push(`${item.name}`);
    }
    itemComponentNames.push(`+${extraGoldCost} gold`);
    return new Question(
      `Which item builds from the following components: `,
      itemComponentNames.join(', '),
      null,
      randomItem.name,
      15
    );
  }

  async function runeFromImage() {
    const randomRune = randomInArray(allRunes);
    const runeUrl = await getRuneIconUrl(randomRune.name);

    return new Question(
      "Which rune's icon is this: ",
      null,
      runeUrl,
      randomRune.name,
      5
    );
  }

  function costFromItem() {
    const purchasableItems = allItemsData.filter(
      (item) => item.gold.purchasable
    );
    const randomItem = randomInArray(purchasableItems);

    return new Question(
      "What's the total gold cost of: ",
      randomItem.name,
      null,
      randomItem.gold.total.toString(),
      5
    );
  }

  function titleFromChamp() {
    const randomChampion = randomInArray(allChampionData);
    const championTitle = randomChampion.title;

    return new Question(
      `What's the champion title of ${randomChampion.name}?`,
      null,
      null,
      championTitle,
      15
    );
  }

  async function champFromEditedSkin() {
    const randomChampion = randomInArray(allChampionData);
    const championSkinUrls = await getChampionSkins(randomChampion.id);
    championSkinUrls.shift();
    const randomSkin = randomInArray(championSkinUrls);
    const skinUrl = randomSkin[0];
    const image = await jimp.read(skinUrl);
    randomInArray(imageEffects)(image);

    return new Question(
      "Which champion's loading screen art is this: ",
      null,
      null,
      randomChampion.name,
      15,
      await image.getBufferAsync(jimp.MIME_JPEG)
    );
  }

  async function champFromAbilityIcon() {
    const randomChampion = randomInArray(allChampionData);
    const champAbilityUrls = await getChampionSpellImages(randomChampion.id);
    champAbilityUrls.shift();
    const randomAbilityIcon = randomInArray(champAbilityUrls);

    return new Question(
      "Which champion's ability icon is this: ",
      null,
      randomAbilityIcon,
      randomChampion.name,
      5
    );
  }

  async function champFromPassiveIcon() {
    const randomChampion = randomInArray(allChampionData);
    const champAbilityUrls = await getChampionSpellImages(randomChampion.id);
    const passiveIcon = champAbilityUrls[0];

    return new Question(
      "Which champion's passive icon is this: ",
      null,
      passiveIcon,
      randomChampion.name,
      5
    );
  }

  return [
    runeFromDescription,
    champFromAbility,
    skinFromImage,
    championFromLore,
    champFromTitle,
    itemFromDescription,
    championFromSkins,
    abilityFromChamp,
    itemFromComponents,
    runeFromImage,
    costFromItem,
    titleFromChamp,
    champFromEditedSkin,
    champFromAbilityIcon,
    champFromPassiveIcon,
  ];
})();

module.exports = questionGenerator;
