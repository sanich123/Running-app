import { delay, HttpResponse } from 'msw';
import { MOCK_SERVER_ERROR } from '@T/responses/runich';

export async function loadingResponse() {
  await delay('infinite');
  return HttpResponse.json({});
}

export function errorResponse() {
  return HttpResponse.json(MOCK_SERVER_ERROR, { status: 500 });
}
