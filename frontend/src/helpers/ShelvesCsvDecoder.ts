import Papa from "papaparse";
import ItemsApi, { ItemsCache } from "../api/ItemsApi";

import Item from "../types/item";

async function decode(shelvesCsvString: string): Promise<Item[][]> {
  const result = Papa.parse(shelvesCsvString, {
    newline: "\n",
    delimiter: ",",
    header: false,
  });

  if (result.errors && result.errors.length > 0) {
    result.errors.forEach((err) => {
      console.error(err);
    });
    return [];
  }

  const shelvesWithItemCodes = result.data as string[][];
  const cache: ItemsCache = {};

  const promises = shelvesWithItemCodes.map((shelf) =>
    shelf.map((itemCode) => ItemsApi.getItem(itemCode, cache))
  );

  const shelves = await Promise.all(promises.map(Promise.all.bind(Promise)));

  return shelves.map((shelf) =>
    shelf.filter((item) => item)
  ) as unknown as Promise<Item[][]>;
}

const ShelvesCsvDecoder = {
  decode,
};

export default ShelvesCsvDecoder;
