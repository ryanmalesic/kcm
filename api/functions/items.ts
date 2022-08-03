import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import { APIGatewayProxyHandlerV2 } from "aws-lambda";

type Item = {
  [key: string]: string;
};

const dynamodbClient = new DynamoDBClient({});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};

const getByItemCode = async (itemCode: string): Promise<Item | null> => {
  const { Item: item } = await dynamodbClient.send(
    new GetItemCommand({
      Key: marshall({ pk: itemCode.substring(0, 7) }),
      TableName: process.env.TABLE,
    })
  );

  if (!item) {
    return null;
  }

  return unmarshall(item);
};

const getByUpc = async (upc: string): Promise<Item | null> => {
  const { Items: items } = await dynamodbClient.send(
    new QueryCommand({
      ExpressionAttributeNames: {
        "#upc": "upc",
      },
      ExpressionAttributeValues: marshall({
        ":upc": `000-${upc.substring(1, 6)}-${upc.substring(6, 11)}`,
      }),
      KeyConditionExpression: "#upc = :upc",
      IndexName: "byUpc",
      TableName: process.env.TABLE,
    })
  );

  if (!items) {
    return null;
  }

  const unmarshalledItems = items.map((item) => unmarshall(item));

  return unmarshalledItems[0] ?? null;
};

const getByClassDesc = async (classDesc: string): Promise<Item[]> => {
  const items: Item[] = [];

  let output: QueryCommandOutput;
  let lastEvaluatedKey: { [key: string]: AttributeValue } | undefined =
    undefined;

  do {
    const command = new QueryCommand({
      ExclusiveStartKey: lastEvaluatedKey,
      ExpressionAttributeNames: {
        "#classDesc": "classDesc",
      },
      ExpressionAttributeValues: marshall({
        ":classDesc": classDesc,
      }),
      KeyConditionExpression: "#classDesc = :classDesc",
      IndexName: "byClassDesc",
      TableName: process.env.TABLE,
    });

    output = await dynamodbClient.send(command);

    if (output.Items) {
      items.push(...output.Items.map((item) => unmarshall(item)));
    }
  } while (lastEvaluatedKey);

  return items;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { id } = event.pathParameters ?? {};
  const { classDesc } = event.queryStringParameters ?? {};

  if (id) {
    let item = (await getByItemCode(id)) ?? (await getByUpc(id)) ?? undefined;

    if (!item) {
      return {
        statusCode: 404,
        headers,
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(item),
    };
  }

  if (classDesc) {
    const items = await getByClassDesc(classDesc);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(items),
    };
  }

  return {
    statusCode: 400,
    headers,
  };
};
