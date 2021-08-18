import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as sst from '@serverless-stack/resources';

import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';

export default class KCMStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const bucket = new sst.Bucket(this, 'Bucket', {
      s3Bucket: {
        cors: [
          {
            maxAge: 3000,
            allowedOrigins: ['*'],
            allowedHeaders: ['*'],
            allowedMethods: [s3.HttpMethods.PUT],
          },
        ],
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    });

    const table = new sst.Table(this, 'Table', {
      fields: {
        pk: sst.TableFieldType.STRING,
        upc: sst.TableFieldType.STRING,
        classDesc: sst.TableFieldType.STRING,
      },
      primaryIndex: { partitionKey: 'pk' },
      secondaryIndexes: {
        byUpc: { partitionKey: 'upc' },
        byClassDesc: { partitionKey: 'classDesc' },
      },
      dynamodbTable: {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    });

    // Create the Parse Function
    const parseFunction = new sst.Function(this, 'ParseFunction', {
      handler: 'src/parse.handler',
      timeout: 900,
      environment: {
        BUCKET: bucket.s3Bucket.bucketName,
        TABLE: table.dynamodbTable.tableName,
      },
    });

    bucket.addNotifications(this, [
      {
        function: parseFunction,
        notificationProps: {
          events: [s3.EventType.OBJECT_CREATED],
          filters: [{ suffix: '.csv' }],
        },
      },
      {
        function: parseFunction,
        notificationProps: {
          events: [s3.EventType.OBJECT_CREATED],
          filters: [{ suffix: '.CSV' }],
        },
      },
    ]);

    bucket.attachPermissions([bucket, table]);

    const auth = new sst.Auth(this, 'Auth', {
      cognito: true,
    });

    const api = new sst.Api(this, 'Api', {
      cors: true,
      defaultAuthorizationType: sst.ApiAuthorizationType.JWT,
      defaultAuthorizer: new HttpUserPoolAuthorizer({
        userPool: auth.cognitoUserPool!,
        userPoolClient: auth.cognitoUserPoolClient!,
      }),
      defaultFunctionProps: {
        environment: {
          BUCKET: bucket.s3Bucket.bucketName,
          TABLE: table.dynamodbTable.tableName,
        },
      },
      routes: {
        'GET  /items': 'src/items.handler',
        'GET  /items/{id}': 'src/items.handler',
        'GET  /presigned': 'src/presigned.handler',
      },
    });

    api.attachPermissions([bucket, table]);

    const react = new sst.ReactStaticSite(this, 'ReactApp', {
      path: 'app/',
      environment: {
        REACT_APP_API_URL: api.url,
        REACT_APP_USER_POOL_ID: auth.cognitoUserPool!.userPoolId,
        REACT_APP_USER_POOL_CLIENT:
          auth.cognitoUserPoolClient!.userPoolClientId,
      },
    });

    // Show API endpoint in output
    new cdk.CfnOutput(this, 'Api.Endpoint', {
      value: api.httpApi.apiEndpoint,
    });

    // Show React App URL in output
    new cdk.CfnOutput(this, 'ReactApp.url', {
      value: react.url,
    });
  }
}
