import { MOCK_COMMENT_LIKES } from '@T/mocks/mock-comment-likes';
import { MOCK_COMMENTS } from '@T/mocks/mock-comments';

export const successLikeToComment = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json(MOCK_COMMENT_LIKES));

export const successGetComments = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json({ comments: MOCK_COMMENTS }));

export const successGetOneComment = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json({ comments: MOCK_COMMENTS.slice(0, 1) }));

export const successGetTwoComment = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json({ comments: MOCK_COMMENTS.slice(0, 2) }));

export const getCommentsFailure = (req: any, res: any, ctx: any) =>
  res(ctx.status(401), ctx.json({ message: 'Bad request' }));
