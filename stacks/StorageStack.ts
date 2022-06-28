import {
  Bucket,
  Function,
  StackContext,
  Table,
} from "@serverless-stack/resources";
import { BlockPublicAccess } from "aws-cdk-lib/aws-s3";

export function StorageStack({ stack }: StackContext) {
  const table = new Table(stack, "Table", {
    fields: {
      pk: "string",
      upc: "string",
      classDesc: "string",
    },
    primaryIndex: { partitionKey: "pk" },
    globalIndexes: {
      byUpc: { partitionKey: "upc" },
      byClassDesc: { partitionKey: "classDesc" },
    },
  });

  const bucket = new Bucket(stack, "Bucket", {
    cors: [
      {
        maxAge: "1 day",
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        exposedHeaders: ["ETag"],
      },
    ],
    notifications: {
      parse: {
        function: {
          handler: "functions/parse.handler",
          permissions: [table],
          environment: {
            TABLE: table.tableName,
          },
          timeout: 600,
        },
        events: ["object_created"],
        filters: [{ suffix: ".csv" }],
      },
    },
    cdk: {
      bucket: {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      },
    },
  });

  bucket.attachPermissions([bucket]);

  return {
    bucket,
    table,
  };
}
