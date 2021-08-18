import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import { APIGatewayProxyHandlerV2, APIGatewayProxyResultV2 } from 'aws-lambda';

type Item = {
  [key: string]: string;
};

type HandleInput =
  | { id: string; classDesc: undefined }
  | { id: undefined; classDesc: string };

const dynamodbClient = new DynamoDBClient({});

const getByItemCode = async (itemCode: string): Promise<Item | null> => {
  const { Item: item } = await dynamodbClient.send(
    new GetItemCommand({
      Key: marshall({ pk: `ITEM#${itemCode.substring(0, 7)}` }),
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
        '#upc': 'upc',
      },
      ExpressionAttributeValues: marshall({
        ':upc': `000-${upc.substring(1, 6)}-${upc.substring(6, 11)}`,
      }),
      KeyConditionExpression: '#upc = :upc',
      IndexName: 'byUpc',
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
        '#classDesc': 'classDesc',
      },
      ExpressionAttributeValues: marshall({
        ':classDesc': classDesc,
      }),
      KeyConditionExpression: '#classDesc = :classDesc',
      IndexName: 'byClassDesc',
      TableName: process.env.TABLE,
    });

    output = await dynamodbClient.send(command);

    if (output.Items) {
      items.push(...output.Items.map((item) => unmarshall(item)));
    }
  } while (lastEvaluatedKey);

  return items;
};

export const handle = async (
  input: HandleInput
): Promise<APIGatewayProxyResultV2> => {
  const { id, classDesc } = input;

  if (id && id.length === 7) {
    const item = await getByItemCode(id);

    return item
      ? {
          statusCode: 200,
          body: JSON.stringify(item),
        }
      : {
          statusCode: 404,
        };
  } else if (id && id.length === 12) {
    const item = (await getByItemCode(id)) ?? (await getByUpc(id));

    return item
      ? {
          statusCode: 200,
          body: JSON.stringify(item),
        }
      : {
          statusCode: 404,
        };
  } else if (classDesc) {
    const items = await getByClassDesc(classDesc);

    return items.length > 0
      ? { statusCode: 200, body: JSON.stringify(items) }
      : {
          statusCode: 404,
        };
  } else {
    return {
      statusCode: 422,
    };
  }
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const { id } = event.pathParameters ?? {};
  const { classDesc } = event.queryStringParameters ?? {};

  return handle({ id, classDesc } as HandleInput);
};
