import Item from "../types/item";

function encode(shelves: Item[][]): string {
  return shelves.reduce(
    (prev, curr, index) =>
      prev +
      `${index !== 0 ? "\n" : ""}${curr.reduce(
        (prev, curr, index) =>
          prev + `${index !== 0 ? "," : ""}${curr.itemCode}`,
        ""
      )}`,
    ""
  );
}

function encodeDetailed(shelves: Item[][]): string {
  return shelves.reduce((prev, curr, index) => {
    const temp: { [key: string]: string[] } = {};

    curr.forEach((item) => {
      temp["brandDescription"] = [
        ...(temp["brandDescription"] ?? []),
        `${item.brand} ${item.description}`,
      ];
      temp["packSize"] = [
        ...(temp["packSize"] ?? []),
        `${item.pack} ${item.size}`,
      ];
      temp["upc"] = [
        ...(temp["upc"] ?? []),
        `${item.upc}${item.restrictPfInd}`,
      ];
      temp["itemCode"] = [...(temp["itemCode"] ?? []), item.itemCode];
    });

    return (
      prev +
      `${index !== 0 ? "\n\n" : ""}${temp["brandDescription"].join(
        ","
      )}\n${temp["packSize"].join(",")}\n${temp["upc"].join(",")}\n${temp[
        "itemCode"
      ].join(",")}`
    );
  }, "");
}

function encodeMissingItems(items: Item[], shelves: Item[][]): string {
  const itemCodesOnShelves = shelves.flat(1).map((item) => item.itemCode);

  return items
    .filter(
      (item, index, arr) =>
        index === arr.findIndex((i) => i.itemCode === item.itemCode) &&
        !itemCodesOnShelves.includes(item.itemCode)
    )
    .map(
      (item) =>
        `${item.itemCode},${item.upc},${item.brand},${item.description},${item.pack},${item.size},${item.classDesc},${item.subClassDescription},${item.restrictPfInd}`
    )
    .join("\n");
}

const ShelvesCsvEncoder = {
  encode,
  encodeDetailed,
  encodeMissingItems,
};

export default ShelvesCsvEncoder;
