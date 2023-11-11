import { rest } from 'msw';

import { MOCK_ACTIVITY } from '../mocks/mock-activity';
import { MOCK_COMMENT_LIKES } from '../mocks/mock-comment-likes';
import { MOCK_COMMENTS } from '../mocks/mock-comments';
import { MOCK_FOLLOWERS } from '../mocks/mock-followers';
import { MOCK_FRIENDS } from '../mocks/mock-friends';
import { MOCK_LOCATION, MOCK_PROFILE } from '../mocks/mock-location';
import { BAD_REQUEST } from '../mocks/mock-requests';

export const handlers = [
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someUserId`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_ACTIVITY)),
  ),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someWrongUserId`, (req, res, ctx) => {
    return res(ctx.status(404), ctx.json(BAD_REQUEST));
  }),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/friend/someFriendId`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json(MOCK_LOCATION)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/someUserId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_PROFILE)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/926f4a53-08b5-43c6-99ee-cf31fdfbb49b`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_PROFILE)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/7857abb1-b125-4f39-becf-8f30216b46ec`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_PROFILE)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/a6135312-595f-4524-b3f3-496a05165d22`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_PROFILE)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/someUserIdWithAnError`, (req, res, ctx) =>
    res(ctx.status(401), ctx.json({ message: 'bad request' })),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/profile/someUserIdWithoutPhoto`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(undefined)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/like/someActivityId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/like/617dddae-05b3-418a-9a8e-5d408a1b897a`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/like/e315eb5b-989c-4215-9d14-d77f4e7e2974`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/like`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json([{ authorId: 'someUserId' }])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENT_LIKES)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/2fd0916a-1fb8-44c4-bb6a-021c092f2713/like`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENT_LIKES)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/189d2c10-463c-42f5-9f09-5e9fa6aa2720`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENTS)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/activityIdWithOneComment`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENTS.slice(0, 1))),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/activityIdWithTwoComments`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENTS.slice(0, 2))),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/e315eb5b-989c-4215-9d14-d77f4e7e2974`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_COMMENTS)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/someActivityId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([MOCK_COMMENTS[0]])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/comment/someWrongActivityId`, (req, res, ctx) =>
    res(ctx.status(401), ctx.json({ message: 'Bad request' })),
  ),
  rest.delete(`${process.env.EXPO_PUBLIC_BASE_URL}/friend/0326e84a-946b-42da-b662-658c4c9a50d9`, (req, res, ctx) =>
    res(ctx.status(204), ctx.json('')),
  ),
  rest.get(
    `${process.env.EXPO_PUBLIC_BASE_URL}/friend/7857abb1-b125-4f39-becf-8f30216b46ec/followers`,
    (req, res, ctx) => res(ctx.status(200), ctx.json(MOCK_FOLLOWERS)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/friend/926f4a53-08b5-43c6-99ee-cf31fdfbb49b`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_FRIENDS)),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/activityId/someActivityId`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json(MOCK_ACTIVITY)),
  ),
  rest.post(`${process.env.EXPO_PUBLIC_BASE_URL}/user/someUserId/profile`, (req, res, ctx) =>
    res(ctx.status(201), ctx.json([1, 2, 3])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someUserId/all`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([MOCK_ACTIVITY])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someUserIdWithEmptyFriendsActivities/all`, (req, res, ctx) =>
    res(ctx.status(200), ctx.json([])),
  ),
  rest.get(`${process.env.EXPO_PUBLIC_BASE_URL}/activity/someIdThatRejectsWithAnError/all`, (req, res, ctx) =>
    res(ctx.status(401), ctx.json({ message: 'bad request' })),
  ),
];
