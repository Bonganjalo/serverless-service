// author: Bonganjalo Hadebe

import { DynamoDB, DynamoType } from './DynamoDB';

// Mock DynamoDB sub function calls;
const mockUpdatePromise = jest.fn().mockImplementation(() => {
  return {
    Attributes: {
      userId: '12',
      activeStreams: ['DOFe98']
    }
  };
});

const mockGetPromise = jest.fn().mockImplementation(() => { return { Item: { activeStreams: ['Ae21', 'DOFe98'] } }; });

const mockDescribeTablePromise = jest.fn().mockImplementation(() => { throw { code: 'ResourceNotFoundException' }; });

const mockDescribeTable = jest.fn().mockImplementation(() => {
  return { promise: mockDescribeTablePromise };
});

// Mock DynamoDB operations
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: jest.fn().mockImplementation(() => {
      return {
        describeTable: mockDescribeTable
      };
    })
  };
});

jest.mock('aws-sdk/clients/dynamodb', () => {
  return {
    DocumentClient: jest.fn().mockImplementation(() => {
      return {
        get: jest.fn().mockImplementation(() => {
          return { promise: mockGetPromise };
        }),

        update: jest.fn().mockImplementation(() => {
          return { promise: mockUpdatePromise };
        })
      };
    })
  };
});
let dynamodb: DynamoType;

beforeEach(() => {
  const options = {
    endpoint: 'test',
    accessKeyId: 'test',
    secretAccessKey: 'test',
    region: 'test'
  };
  dynamodb = DynamoDB(options, 'dev');
});

describe('DynamoDB', () => {

  it('an error should be throw by the function if the table doesn\'t', async () => {
    let error;
    try {
      await dynamodb.checkTable('Non-existing');
    }
    catch (e) {
      error = e;
    }
    expect(error).toEqual(new Error('Table Non-existing does not exist. Please create table'));

  });

  it('handle the rest of the errors thrown inside checkTable', async () => {
    mockDescribeTablePromise.mockClear();
    mockDescribeTablePromise.mockImplementation(() => { throw new Error('Unexpected'); });
    let error;
    try {
      await dynamodb.checkTable('Existing');
    }
    catch (e) {
      error = e;
    }
    expect(error).toEqual(new Error('Unexpected'));

  });

  it('describeTable function should have been called with Non-existing at this point', () => {
    const params = {
      TableName: 'Non-existing'
    };

    expect(mockDescribeTable).toHaveBeenCalledWith(params);
  });

  it('should true if the table doesn\'t', async () => {
    mockDescribeTablePromise.mockClear();
    mockDescribeTablePromise.mockReturnValue(true);

    const response = await dynamodb.checkTable('Existing');

    expect(response).toEqual(true);
  });

  it('describeTable function should have been called with Existing at this point', () => {
    const params = {
      TableName: 'Existing'
    };

    expect(mockDescribeTable).toHaveBeenCalledWith(params);
  });

  it('should return array of streams if table exists', async () => {
    mockDescribeTablePromise.mockClear();
    mockDescribeTablePromise.mockReturnValue(true);

    const response = await dynamodb.getStreams('Table', 'Test');

    expect(response).toEqual(['Ae21', 'DOFe98']);
  });

  it('describeTable function should have been called with Table at this point', () => {
    const params = {
      TableName: 'Table'
    };

    expect(mockDescribeTable).toHaveBeenCalledWith(params);
  });

  it('should return an object with update results', async () => {
    mockDescribeTablePromise.mockClear();
    mockDescribeTablePromise.mockReturnValue(true);

    const response = await dynamodb.saveStream('Table2', '12', ['DOFe98']);

    expect(response).toEqual({
      Attributes: {
        userId: '12',
        activeStreams: ['DOFe98']
      }
    });
  });

  it('describeTable function should have been called with Table2 at this point', () => {
    const params = {
      TableName: 'Table2'
    };

    expect(mockDescribeTable).toHaveBeenCalledWith(params);
  });
});
