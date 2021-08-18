/* eslint-disable no-console */
import { DynamoDB, WriteRequest } from '@aws-sdk/client-dynamodb';
import { S3 } from '@aws-sdk/client-s3';
import { marshall } from '@aws-sdk/util-dynamodb';
import { APIGatewayProxyResultV2, S3CreateEvent } from 'aws-lambda';
import parse from 'csv-parse';

const dynamoDBClient = new DynamoDB({});
const s3Client = new S3({});

const columns = [
  'custNbr',
  'runDate',
  'effDate',
  'zone',
  'prodCode',
  'brand',
  'description',
  'pack',
  'size',
  'cusPrd',
  'poaIdent',
  'itemCode',
  'restrictPfInd',
  'dealPackInd',
  'cripPoa',
  'slowMover',
  'fullCaseInd',
  'dsdInd',
  'thirteenWk',
  'akaType',
  'upc',
  'allow',
  'allowInd',
  'allowEndDate',
  'cost',
  'costInd',
  'netCost',
  'unitCost',
  'netUnitCost',
  'zoneNbr',
  'baseZoneMult',
  'baseZoneSrp',
  'baseZoneInd',
  'baseZonePct',
  'baseZonePctInd',
  'rdcdZoneMult',
  'rdcdZoneSrp',
  'rdcdZoneInd',
  'rdcdZonePct',
  'rdcdZonePctInd',
  'baseCripMult',
  'baseCripSrp',
  'baseCripSrpInd',
  'baseCripPct',
  'baseCripPctInd',
  'rdcdCripMult',
  'rdcdCripSrp',
  'rdcdCripSrpInd',
  'rdcdCripPct',
  'rdcdCripPctInd',
  'rdcdSrpInd',
  'endDate',
  'palletQty',
  'itemAuth',
  'itemStatus',
  'categoryClass',
  'categoryClassDescription',
  'classId',
  'classDesc',
  'subClassId',
  'subClassDescription',
  'varietyId',
  'varietyDesc',
] as const;

type RecordItem = { [key in typeof columns[number]]: string };

const batchPutItems = async (items: WriteRequest[]): Promise<void> => {
  await dynamoDBClient.batchWriteItem({
    RequestItems: { [process.env.TABLE as string]: items },
  });
};

export async function handle(
  fileName: string,
  fileSize: number
): Promise<APIGatewayProxyResultV2> {
  const start = new Date();

  let runDate = '';

  const file = await s3Client.getObject({
    Bucket: process.env.BUCKET,
    Key: fileName,
  });

  const parser = (file.Body as any).pipe(
    parse({
      columns: Array.from(columns),
      fromLine: 4,
      relax: true,
      relaxColumnCount: true,
      // toLine: 10, // Uncomment for testing (won't blow up logs)
      trim: true,
    })
  );

  const classDescs = new Set();

  let itemCount = 1;
  let itemsToPut: WriteRequest[] = [];

  const itemsPut: { [key: string]: boolean } = {};

  // eslint-disable-next-line no-restricted-syntax
  for await (const record of parser) {
    if (!runDate) {
      runDate = new Date(Date.parse(record.runDate)).toISOString().slice(0, 10);
    }

    const { itemCode } = record as RecordItem;
    const itemPk = `ITEM#${itemCode}`;

    if (!itemsPut[itemPk]) {
      classDescs.add(record.classDesc);
      itemCount += 1;
      itemsPut[itemPk] = true;

      itemsToPut.push({
        PutRequest: {
          Item: marshall({
            ...record,
            pk: itemPk,
            type: 'ITEM',
          }),
        },
      });

      if (itemsToPut.length === 25) {
        try {
          await batchPutItems(itemsToPut);
          itemsToPut = [];
        } catch (error) {
          console.log(
            'ERROR OCCURRED IN BATCHPUTITEMS',
            error.message,
            JSON.stringify(itemsToPut)
          );
          return {};
        }
      }
    }
  }

  if (itemsToPut.length > 0) {
    try {
      await batchPutItems(itemsToPut);
    } catch (error) {
      console.log(
        'ERROR OCCURRED IN BATCHPUTITEMS',
        error.message,
        JSON.stringify(itemsToPut)
      );
      return {};
    }
  }

  console.log(`${itemCount} Items inserted.`);
  console.log(`Inserting Book{runDate=${runDate}}.`);

  const bookPk = `BOOK`;

  try {
    await dynamoDBClient.putItem({
      Item: marshall({
        pk: bookPk,
        type: 'BOOK',
        classDescs: Array.from(classDescs),
        fileName,
        fileSize: fileSize.toString(),
        itemCount: itemCount.toString(),
        runDate,
      }),
      TableName: process.env.TABLE,
    });
  } catch (error) {
    console.log('ERROR OCCURRED IN PUTITEM BOOK', error.message);
    return {};
  }

  const end = new Date();
  const time = (end.getTime() - start.getTime()) / 1000;

  console.log(
    `Book{runDate=${runDate}}'s ${itemCount} items inserted in ${time} seconds.`
  );

  return {};
}

export const handler = async (
  event: S3CreateEvent
): Promise<APIGatewayProxyResultV2> => {
  const fileName = event.Records[0].s3.object.key;
  const fileSize = Math.round(event.Records[0].s3.object.size / 10485.76) / 100;

  return handle(fileName, fileSize);
};
