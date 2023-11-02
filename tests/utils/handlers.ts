import { rest } from 'msw';

import { MOCK_LOCATION, MOCK_PROFILE } from '../mocks/mock-activity';
import { MOCK_COMMENT_LIKES } from '../mocks/mock-comment-likes';

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
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/like/someActivityId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/like/617dddae-05b3-418a-9a8e-5d408a1b897a`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/like`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.get('https://runich-backend.onrender.com/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENT_LIKES)),
  ),
];
