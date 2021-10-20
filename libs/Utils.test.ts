// author: Bonganjalo Hadebe

import { Utils } from './Utils';

let utils;
beforeEach(() => {
  utils = Utils();
});

describe('Utils', () => {

  it('should return false if there is no body or userId', () => {
    const request = {};

    expect(utils.isRequestValid(request)).toEqual(false);
  });

  it('should return true if there is body and userId', () => {
    const request = {
      body: {
        userId: 'test'
      }
    };

    expect(utils.isRequestValid(request)).toEqual(true);
  });

  it('should return true if userId is a string', () => {
    const request = {
      body: {
        userId: 'test'
      }
    };

    expect(utils.isUserIdString(request)).toEqual(true);
  });

  it('should return false if userId is not a string', () => {
    const request = {
      body: {
        userId: 302030
      }
    };

    expect(utils.isUserIdString(request)).toEqual(false);
  });

});
