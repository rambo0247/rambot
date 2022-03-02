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
  async getChampionSkins(championName) {
    try {
      const championSkinsData = await galeforceUtils.getChampionSkinsData(
        championName
      );
      const imageUrls = [];
      for (const skin of championSkinsData) {
        imageUrls.push(
          galeforce.lol.ddragon.champion.art
            .splash()
            .champion(championName)
            .skin(skin.num)
            .URL()
        );
      }
      return imageUrls;
    } catch (error) {
      return 'Could not find skins for that champion.';
    }
  },
  async getChampionSpells(championName) {
    try {
      const championData = await galeforceUtils.getChampionData(championName);
      const championSpells = [championData.passive, ...championData.spells];
      return championSpells;
    } catch (error) {
      return 'Could not find spells for that champion';
    }
  },
  async getChampionSpellImages(championName) {
    try {
      const imageUrls = [];
      const championSpells = await galeforceUtils.getChampionSpells(
        championName
      );
      for (const spell of championSpells) {
        const spellName = spell.image.full.replace('.png', '');
        const spellUrl = galeforce.lol.ddragon.spell
          .art()
          .version(await galeforceUtils.getLatestVersion())
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
  async getItemData(items) {
    const allItemsData = await galeforceUtils.getAllItemsData();
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
  async getItemBuildComponents(itemName) {
    try {
      const itemData = await galeforceUtils.getItemData(itemName);
      const itemComponentIds = itemData.from;
      if (!itemComponentIds) return false;
      const allItemsData = await galeforceUtils.getAllItemsData();
      const itemComponents = allItemsData.filter((item) =>
        itemComponentIds.includes(item.image.full.replace('.png', ''))
      );
      return itemComponents;
    } catch (error) {
      return 'Could not find components from that item name';
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
