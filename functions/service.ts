import * as AWS from 'aws-sdk';
import { DynamoDB, DynamoType } from '../libs/DynamoDB';
import { Utils } from '../libs/Utils';

let dynamodb: DynamoType;
let utils: any;

const STAGE = process.env.STAGE || 'dev';

const options = {
  endpoint: 'http://localhost:8000',
  accessKeyId: 'testKeyId',
  secretAccessKey: 'testSecretAccessKey',
  region: 'eu-central-1'
};

export const handler = async (event, context, callback) => {
  dynamodb = dynamodb || DynamoDB(options, STAGE);
  utils = utils || Utils();
  let error:any;
  const request = (event && event.body) ? { body: JSON.parse(event.body) } : {};

  if (!utils.isRequestValid(request)) {  // Validate request
    error = {
      error: {
        name: 'INVALID_REQUEST',
        message: 'userId is required'
      }
    };

    console.error({
      action: 'app:isRequestValid',
      timestamp: new Date().toISOString(),
      data: error
    });

    return {}; // .status(400).json();
  }

  if (!utils.isUserIdString(request)) {  // Validate request
    error = {
      error: {
        name: 'INVALID_REQUEST',
        message: 'userId must be a string'
      }
    };

    console.error({
      action: 'app:isUserIdString',
      timestamp: new Date().toISOString(),
      data: error
    });

    return {}; // response.status(400).json(error);
  }

  try {

  } catch (err) {
    callback(err);
  }

};
