import { Api, StackContext, use } from "@serverless-stack/resources";

import { StorageStack } from "./StorageStack";

export function ApiStack({ stack, app }: StackContext) {
  const { table } = use(StorageStack);

  const api = new Api(stack, "Api", {
    defaults: {
      function: {
        timeout: 10,
        permissions: [table],
        environment: {
          TABLE: table.tableName,
        },
      },
    },
    cors: true,
    routes: {
      "GET /items": "functions/items.handler",
      "GET /items/{id}": "functions/items.handler",
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return {
    api,
  };
}
