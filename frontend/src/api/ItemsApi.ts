import { API } from "@aws-amplify/api";

import Item from "../types/item";

export type ItemsCache = { [key: string]: Item };

function getItemFromCache(id: string, cache: ItemsCache): Item | undefined {
  return (
    cache[id.substring(0, 7)] ??
    cache[`000-${id.substring(1, 6)}-${id.substring(6, 11)}`]
  );
}

async function getItem(
  id: string,
  cache: ItemsCache = {}
): Promise<Item | undefined> {
  let item = getItemFromCache(id, cache);

  if (item) {
    return item;
  }

  try {
    item = await API.get("items", `/items/${id}`, {});
    return item;
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

async function getItemsByClassDesc(classDesc: string): Promise<Item[]> {
  try {
    const items = API.get("items", `/items?classDesc=${classDesc}`, {});
    return items;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function updateCache(item: Item, cache: ItemsCache) {
  if (!cache[item.itemCode]) {
    try {
      const items = await ItemsApi.getItemsByClassDesc(item.classDesc);
      items.forEach((item) => {
        cache[item.itemCode] = item;
        cache[item.upc] = item;
      });
    } catch (err) {
      console.log(err);
    }
  }
}

const ItemsApi = {
  getItem,
  getItemsByClassDesc,
  updateCache,
};

export default ItemsApi;
