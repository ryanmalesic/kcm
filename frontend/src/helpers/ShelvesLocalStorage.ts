import Item from "../types/item";
import ShelvesCsvDecoder from "./ShelvesCsvDecoder";
import ShelvesCsvEncoder from "./ShelvesCsvEncoder";

const SHELVES_LOCAL_STORAGE_KEY = "SHELVES";

function set(shelves: Item[][]) {
  const shelvesCsvString = ShelvesCsvEncoder.encode(shelves);
  localStorage.setItem(SHELVES_LOCAL_STORAGE_KEY, shelvesCsvString);
}

async function get(): Promise<Item[][]> {
  const shelvesCsvString = localStorage.getItem(SHELVES_LOCAL_STORAGE_KEY);
  if (!shelvesCsvString) {
    return [[]];
  }

  return await ShelvesCsvDecoder.decode(shelvesCsvString);
}

const ShelvesLocalStorage = {
  get,
  set,
};

export default ShelvesLocalStorage;
