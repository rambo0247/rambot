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
};

module.exports = galeforceUtils;
