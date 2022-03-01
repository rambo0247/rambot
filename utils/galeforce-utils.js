const GaleforceModule = require('galeforce');
const galeforce = new GaleforceModule('./galeforce-config.yml');

galeforceUtils = {
  async getLatestVersion() {
    return (await galeforce.lol.ddragon.versions().exec())[0];
  },
  async getChampionsList() {
    const championList = (
      await galeforce.lol.ddragon.champion
        .list()
        .version(await galeforceUtils.getLatestVersion())
        .locale('en_US')
        .exec()
    ).data;
    return Object.values(championList);
  },
  async getChampionData(championName) {
    const championData = (
      await galeforce.lol.ddragon.champion
        .details()
        .version(await galeforceUtils.getLatestVersion())
        .locale('en_US')
        .champion(championName)
        .exec()
    ).data;
    return championData[championName];
  },
  async getChampionSkinsData(championName) {
    return (await galeforceUtils.getChampionData(championName)).skins;
  },
  async getAllItemsData() {
    const itemsBufferObject = await galeforce.lol.ddragon
      .asset()
      .assetPath(
        `/${await galeforceUtils.getLatestVersion()}/data/en_US/item.json`
      )
      .exec();
    const itemsData = Object.values(
      JSON.parse(itemsBufferObject.toString()).data
    );
    return itemsData;
  },
  async getItemData(itemName) {
    const allItemsData = await galeforceUtils.getAllItemsData();
    try {
      const itemData = allItemsData.find(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      );
      return itemData;
    } catch (error) {
      return error;
    }
  },
  async getItemIconUrl(itemName) {
    const itemData = await galeforceUtils.getItemData(itemName);
    try {
      const itemIconUrl = galeforce.lol.ddragon.item
        .art()
        .assetId(itemData.image.full.replace('.png', ''))
        .version(await galeforceUtils.getLatestVersion())
        .URL();
      return itemIconUrl;
    } catch (error) {
      return error;
    }
  },
  async getAllRunesData() {
    const rawRuneDate = await galeforce.lol.ddragon.rune
      .list()
      .locale('en_US')
      .version(await galeforceUtils.getLatestVersion())
      .exec();
    const runeData = rawRuneDate.flatMap((runeTree) =>
      runeTree.slots.flatMap((rune) => rune.runes)
    );
    return runeData;
  },
  async getRuneData(runeName) {
    try {
      const runesList = await galeforceUtils.getRunesListData();
      const runeData = runesList.find(
        (rune) => rune.name.toLowerCase() === runeName.toLowerCase()
      );
      return runeData;
    } catch (error) {
      return error;
    }
  },
  async getRuneIconUrl(runeName) {
    const rune = await galeforceUtils.getRuneData(runeName);
    try {
      const imgUrl = galeforce.lol.ddragon.rune
        .art()
        .assetPath(rune.icon.replace('perk-images', ''))
        .URL();
      return imgUrl;
    } catch (error) {
      return error;
    }
  },
};

module.exports = galeforceUtils;
