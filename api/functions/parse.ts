import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { S3 } from "@aws-sdk/client-s3";
import { marshall } from "@aws-sdk/util-dynamodb";
import { S3CreateEvent } from "aws-lambda";
import * as parse from "csv-parse";

import { itemColumns, RecordItem } from "../types/item";

const dynamoClient = new DynamoDB({});
const s3Client = new S3({});

export const handler = async (event: S3CreateEvent) => {
  const fileName = event.Records[0].s3.object.key;
  const fileSize = Math.round(event.Records[0].s3.object.size / 10485.76) / 100;
  const start = new Date();
  let runDate = "";

  const file = await s3Client.getObject({
    Bucket: event.Records[0].s3.bucket.name,
    Key: fileName,
  });

  const parser = (file.Body as any).pipe(
    parse.parse({
      columns: Array.from(itemColumns),
      fromLine: 4,
      relax_quotes: true,
      relaxColumnCount: true,
      // toLine: process.env.IS_LOCAL ? 4000 : undefined,
      trim: true,
    })
  );

  const classDescs = new Set();
  const itemsSeen: { [key: string]: boolean } = {};
  let itemsToPut: RecordItem[] = [];
  let itemCount = 1;

  for await (const record of parser) {
    if (!runDate) {
      runDate = new Date(Date.parse(record.runDate)).toISOString().slice(0, 10);
    }

    const { itemCode } = record as RecordItem;

    if (!itemsSeen[itemCode]) {
      classDescs.add(record.classDesc);
      itemsSeen[itemCode] = true;
      itemsToPut.push(record);
      itemCount += 1;
    }

    if (itemsToPut.length === 1000) {
      const promises = itemsToPut.map((item) =>
        dynamoClient.putItem({
          Item: marshall({ ...item, pk: item.itemCode, type: "ITEM" }),
          TableName: process.env.TABLE,
        })
      );

      await Promise.all(promises);

      console.log("1000 items inserted.");
      itemsToPut = [];
    }
  }

  if (itemsToPut.length > 0) {
    const promises = itemsToPut.map((item) =>
      dynamoClient.putItem({
        Item: marshall({ ...item, pk: item.itemCode, type: "ITEM" }),
        TableName: process.env.TABLE,
      })
    );

    await Promise.all(promises);

    console.log("1000 items inserted.");
  }

  console.log(`${itemCount} items inserted.`);
  console.log(`Inserting Book{runDate=${runDate}}.`);

  const bookPk = "BOOK";

  await dynamoClient.putItem({
    Item: marshall({
      pk: bookPk,
      type: "BOOK",
      classDescs: Array.from(classDescs),
      fileName,
      fileSize: fileSize.toString(),
      itemCount: itemCount.toString(),
      runDate,
    }),
    TableName: process.env.TABLE,
  });

  const end = new Date();
  const time = (end.getTime() - start.getTime()) / 1000;
  console.log(
    `Book{runDate=${runDate}}'s ${itemCount} items inserted in ${time} seconds.`
  );

  return {};
};
