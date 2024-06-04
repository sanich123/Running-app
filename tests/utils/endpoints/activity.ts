import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_PHOTOS } from '@T/mocks/mock-photos';
import { MOCK_BAD_REQUEST } from '@T/mocks/mock-requests';

export function postActivitySuccess(req: any, res: any, ctx: any) {
  return res(ctx.status(201), ctx.json(MOCK_ACTIVITY));
}

export const postActivityFailure = (req: any, res: any, ctx: any) =>
  res(
    ctx.status(400),
    ctx.json({
      error: 'Bad Request',
      message: [Array],
      statusCode: 400,
    }),
  );

export const getActivityByActivityId = (req: any, res: any, ctx: any) => res(ctx.status(200), ctx.json(MOCK_ACTIVITY));

export const getAllActivitiesByUserId = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json([MOCK_ACTIVITY]));

export const getEmptyListActivitiesByUserId = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json({ activities: [MOCK_ACTIVITY], isLastPage: false }));

export const getAllCtivitiesByUserIdFailure = (req: any, res: any, ctx: any) =>
  res(ctx.status(401), ctx.json(MOCK_BAD_REQUEST));

export const getPhotosFromActivities = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json({ photos: MOCK_PHOTOS }));

export const getPhotosFromActivitiesFailure = (req: any, res: any, ctx: any) =>
  res(ctx.status(400), ctx.json(MOCK_BAD_REQUEST));
