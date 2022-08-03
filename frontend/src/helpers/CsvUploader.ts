import Papa from "papaparse";
import Item from "../types/item";
import ShelvesCsvDecoder from "./ShelvesCsvDecoder";

const ITEM_CODES_REGEX = /(?:[0-9]{7},)*(?:[0-9]{7})/g;

async function uploadChart(file: Papa.LocalFile): Promise<Item[][]> {
  const promise = new Promise<string[][]>((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ",",
      header: false,
      complete(results, _file) {
        resolve(results.data as string[][]);
      },
      error(err, _file) {
        reject(err);
      },
    });
  });

  const shelvesCsvString = (await promise).reduce(
    (prev, curr) => `${prev}\n${curr.join(",")}`,
    ""
  );

  const itemCodeStrings = [...shelvesCsvString.matchAll(ITEM_CODES_REGEX)];

  if (ITEM_CODES_REGEX.test(shelvesCsvString)) {
    return ShelvesCsvDecoder.decode(itemCodeStrings.join("\n"));
  } else {
    return [[]];
  }
}

const CsvUploader = {
  uploadChart,
};

export default CsvUploader;
