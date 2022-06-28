export const itemColumns = [
  "custNbr",
  "runDate",
  "effDate",
  "zone",
  "prodCode",
  "brand",
  "description",
  "pack",
  "size",
  "cusPrd",
  "poaIdent",
  "itemCode",
  "restrictPfInd",
  "dealPackInd",
  "cripPoa",
  "slowMover",
  "fullCaseInd",
  "dsdInd",
  "thirteenWk",
  "akaType",
  "upc",
  "allow",
  "allowInd",
  "allowEndDate",
  "cost",
  "costInd",
  "netCost",
  "unitCost",
  "netUnitCost",
  "zoneNbr",
  "baseZoneMult",
  "baseZoneSrp",
  "baseZoneInd",
  "baseZonePct",
  "baseZonePctInd",
  "rdcdZoneMult",
  "rdcdZoneSrp",
  "rdcdZoneInd",
  "rdcdZonePct",
  "rdcdZonePctInd",
  "baseCripMult",
  "baseCripSrp",
  "baseCripSrpInd",
  "baseCripPct",
  "baseCripPctInd",
  "rdcdCripMult",
  "rdcdCripSrp",
  "rdcdCripSrpInd",
  "rdcdCripPct",
  "rdcdCripPctInd",
  "rdcdSrpInd",
  "endDate",
  "palletQty",
  "itemAuth",
  "itemStatus",
  "categoryClass",
  "categoryClassDescription",
  "classId",
  "classDesc",
  "subClassId",
  "subClassDescription",
  "varietyId",
  "varietyDesc",
] as const;

export type RecordItem = { [key in typeof itemColumns[number]]: string };
