const GaleforceModule = require('galeforce');
const galeforce = new GaleforceModule('./galeforce-config.yml');

const galeforceUtils = (async function () {
  const latestVersion = (await galeforce.lol.ddragon.versions().exec())[0];
  const allRunesData = await getAllRunesData();
  const allItemsData = await getAllItemsData();

  async function getChampionsList() {
    const championList = (
      await galeforce.lol.ddragon.champion
        .list()
        .version(latestVersion)
        .locale('en_US')
        .exec()
    ).data;
    return Object.values(championList);
  }

  async function getChampionData(championName) {
    const championData = (
      await galeforce.lol.ddragon.champion
        .details()
        .version(latestVersion)
        .locale('en_US')
        .champion(championName)
        .exec()
    ).data;
    return championData[championName];
  }

  async function getChampionSkins(championName) {
    try {
      const championSkinsData = (await getChampionData(championName)).skins;
      const imageUrls = [];
      for (const skin of championSkinsData) {
        const url = galeforce.lol.ddragon.champion.art
          .splash()
          .champion(championName)
          .skin(skin.num)
          .URL();
        const skinName = skin.name;
        imageUrls.push({ url, skinName });
      }
      return imageUrls;
    } catch (error) {
      return 'Could not find skins for that champion.';
    }
  }

  async function getChampionSpells(championName) {
    try {
      const championData = await getChampionData(championName);
      const championSpells = [championData.passive, ...championData.spells];
      return championSpells;
    } catch (error) {
      return 'Could not find spells for that champion';
    }
  }

  async function getChampionSpellImages(championName) {
    try {
      const imageUrls = [];
      const championSpells = await getChampionSpells(championName);
      for (const spell of championSpells) {
        const spellName = spell.image.full.replace('.png', '');
        const spellUrl = galeforce.lol.ddragon.spell
          .art()
          .version(latestVersion)
          .spell(spellName)
          .URL();
        imageUrls.push(spellUrl);
      }
      const passiveUrl = imageUrls[0].split('/');
      passiveUrl.splice(6, 1, 'passive');
      imageUrls[0] = passiveUrl.join('/');
      return imageUrls;
    } catch (error) {
      return 'Could not get spell images for that champion';
    }
  }

  async function getAllItemsData() {
    const itemsBufferObject = await galeforce.lol.ddragon
      .asset()
      .assetPath(`/${latestVersion}/data/en_US/item.json`)
      .exec();
    const itemsData = Object.values(
      JSON.parse(itemsBufferObject.toString()).data
    );
    return itemsData;
  }

  async function getItemData(items) {
    try {
      if (items.length > 1) {
        const itemsData = allItemsData.filter((item) =>
          items.includes(item.name.toLowerCase())
        );
        return itemsData;
      }
      const itemsData = allItemsData.find((item) =>
        items.includes(item.name.toLowerCase())
      );
      return itemsData;
    } catch (error) {
      return error;
    }
  }

  async function getItemBuildComponents(itemName) {
    try {
      const itemData = await getItemData(itemName);
      const itemComponentIds = itemData.from;
      if (!itemComponentIds) return false;
      const itemComponents = itemComponentIds.flatMap((itemId) =>
        allItemsData.filter(
          (item) => itemId === item.image.full.replace('.png', '')
        )
      );
      return itemComponents;
    } catch (error) {
      return 'Could not find components from that item name';
    }
  }

  async function getAllRunesData() {
    const rawRuneDate = await galeforce.lol.ddragon.rune
      .list()
      .locale('en_US')
      .version(latestVersion)
      .exec();
    const runeData = rawRuneDate.flatMap((runeTree) =>
      runeTree.slots.flatMap((rune) => rune.runes)
    );
    return runeData;
  }

  async function getRuneData(runeName) {
    try {
      const runeData = allRunesData.find(
        (rune) => rune.name.toLowerCase() === runeName.toLowerCase()
      );
      return runeData;
    } catch (error) {
      return error;
    }
  }

  async function getRuneIconUrl(runeName) {
    const rune = await getRuneData(runeName);
    try {
      const imgUrl = galeforce.lol.ddragon.rune
        .art()
        .assetPath(rune.icon.replace('perk-images', ''))
        .URL();
      return imgUrl;
    } catch (error) {
      return error;
    }
  }

  return {
    getChampionsList,
    getChampionData,
    getChampionSkins,
    getChampionSpells,
    getChampionSpellImages,
    getAllItemsData,
    getItemBuildComponents,
    getAllRunesData,
    getRuneIconUrl,
  };
})();

module.exports = galeforceUtils;
