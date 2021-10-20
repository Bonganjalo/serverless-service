// author: Bonganjalo Hadebe

import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

interface Options {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface DynamoType {
  getStreams(tableName: string, userId: string):Promise<any>;
  saveStream(tableName: string, userId: string, listOfStreams: string[]):Promise<DocumentClient.UpdateItemOutput>;
  checkTable(tableName: string):Promise<boolean>;
}

export function DynamoDB(options: Options, stage: string) {

  let dynamoDBClient: DocumentClient;
  let dynamodb: AWS.DynamoDB;

  // Declare and init DynamoDB
  if (stage !== 'dev') {
    dynamoDBClient = new DocumentClient();
    dynamodb = new AWS.DynamoDB();
  }
  else {
    dynamoDBClient = new DocumentClient(options);
    dynamodb = new AWS.DynamoDB(options);
  }

   // Check if the table exists. Throw an error if doesn't
  const checkTable = async (tableName: string) => {
    const describeParams: AWS.DynamoDB.DescribeTableInput = {
      TableName: tableName
    };
    try {
      await dynamodb.describeTable(describeParams).promise();
    }
    catch (e) {
      console.info({
        action: 'checkTable',
        timestamp: new Date().toISOString(),
        data: e
      });

      if (e.code === 'ResourceNotFoundException') {
        throw new Error(`Table ${ tableName } does not exist. Please create table`);
      }
      throw e;
    }

    return true;
  };

  // Save the new created into the DB
  const saveStream = async (tableName: string, userId: string, listOfStreams: string[]) => {
    await checkTable(tableName);
    const writeParams: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      ExpressionAttributeNames: {
        '#STREAMS': 'activeStreams'
      },
      ExpressionAttributeValues: {
        ':strm': listOfStreams
      },
      Key: {
        userId
      },
      ReturnValues: 'ALL_NEW',
      TableName: tableName,
      UpdateExpression: 'SET #STREAMS = :strm'
    };

    const dbResponse: AWS.DynamoDB.DocumentClient.UpdateItemOutput = await dynamoDBClient.update(writeParams).promise();
    return dbResponse;
  };

  const getStreams = async(tableName: string, userId: string) => {
    await checkTable(tableName);
    // Get the active streams from the DB
    const dbResponse: AWS.DynamoDB.DocumentClient.GetItemOutput =  await dynamoDBClient.get({ TableName:tableName, Key:{ userId } }).promise();
    return (dbResponse && dbResponse.Item && dbResponse.Item.activeStreams) ? dbResponse.Item.activeStreams : [];
  };

  return Object.freeze({
    getStreams,
    saveStream,
    checkTable
  });

}
