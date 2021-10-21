import * as AWS from 'aws-sdk';
import { DynamoDB, DynamoType } from '../libs/DynamoDB';
import { Utils } from '../libs/Utils';
import { uuid } from 'uuidv4';

let dynamodb: DynamoType;
let utils: any;

const STAGE = process.env.STAGE || 'dev';

const options = {
  endpoint: 'http://localhost:8000',
  accessKeyId: 'testKeyId',
  secretAccessKey: 'testSecretAccessKey',
  region: 'eu-central-1'
};

export const handler = async (event, callback) => {

  dynamodb = dynamodb || DynamoDB(options, STAGE);
  utils = utils || Utils();
  let error:any;
  const MAX = process.env.MAX || 3;
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

    return {
      statusCode: 400,
      body: JSON.stringify(error)
    };
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

    return {
      statusCode: 400,
      body: JSON.stringify(error)
    };
  }

  try {
    const streams = await dynamodb.getStreams('active-stream-dev', request.body.userId);

    console.info({
      action: 'app:getStreams',
      timestamp: new Date().toISOString(),
      data: streams
    });

    if (streams.length >= MAX) {  // Check if the max number of concurrent streams is not reached

      error = {
        userId: request.body.userId,
        error: {
          name: 'MAX_CONCURRENT_STREAMS',
          message: 'Client reached maximum number of concurrent streams allowed'
        }
      };

      console.info({
        action: 'app:max check',
        timestamp: new Date().toISOString(),
        data: error
      });

      return {
        statusCode: 403,
        body: JSON.stringify(error)
      };
    }

    const stream = uuid();
    streams.push(stream);

    await dynamodb.saveStream('active-stream-dev', request.body.userId, streams);

    console.info({
      action: 'app:saveStream',
      timestamp: new Date().toISOString(),
      data: {
        userId: request.body.userId,
        streamId: stream
      }
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ userId: request.body.userId, streamId: stream })
    };

  } catch (err) {
    console.info({
      action: 'app: try catch error',
      timestamp: new Date().toISOString(),
      data: err
    });

    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }

};
