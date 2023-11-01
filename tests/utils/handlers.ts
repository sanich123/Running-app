import { rest } from 'msw';

import { MOCK_LOCATION, MOCK_PROFILE } from '../mocks/mock-activity';

export const handlers = [
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someUserId`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_LOCATION)),
  ),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someWrongUserId`, (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: { data: { message: 'Bad request' } } }));
  }),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/friend/someFriendId`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_LOCATION)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/someUserId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_PROFILE)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/someUserIdWithAnError`, (req, res, ctx) =>
    res(ctx.status(401), ctx.json({ error: { data: { message: 'Bad request' } } })),
  ),
];
