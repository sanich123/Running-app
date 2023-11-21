export const BAD_REQUEST = {
  data: { error: 'Bad Request', message: ['id must be a UUID'], statusCode: 400 },
  status: 400,
};

export const MOCK_BAD_REQUEST = {
  data: { error: 'Bad Request', message: ['id must be a UUID'], statusCode: 401 },
  status: 401,
};
