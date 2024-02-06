export const likeToActivitySucces = (req: any, res: any, ctx: any) =>
  res(ctx.status(200), ctx.json([{ authorId: 'someUserId' }]));

export const postLikeSuccess = (req: any, res: any, ctx: any) =>
  res(ctx.status(201), ctx.json([{ authorId: 'someUserId' }]));
