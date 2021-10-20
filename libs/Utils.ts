// author: Bonganjalo Hadebe

interface Request {
  body: {
    userId: string;
  };
}
export function Utils() {

    // Check if the request body is valid
  const isRequestValid = (request:Request) => {

    if (!request.body || !request.body.userId) {
      return false;
    }
    return true;
  };

  const isUserIdString = (request:Request) => {

    if (typeof(request.body.userId) !== 'string') {
      return false;
    }
    return true;
  };

  return Object.freeze({
    isRequestValid,
    isUserIdString
  });

}
