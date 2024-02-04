import { MOCK_PROFILE } from '@T/mocks/mock-location';

export const getProfileSuccess = (
  _req: any,
  res: (arg0: any, arg1: any) => any,
  ctx: {
    status: (arg0: number) => any;
    json: (arg0: {
      bio: string;
      birthday: string;
      city: string;
      createdAt: string;
      gender: string;
      id: string;
      name: string;
      profilePhoto: string;
      sport: string;
      surname: string;
      updatedAt: string;
      user_id: string;
      weight: string;
    }) => any;
  },
) => res(ctx.status(200), ctx.json(MOCK_PROFILE));

export const getProfileFailure = (
  _req: any,
  res: (arg0: any, arg1: any) => void,
  ctx: { status: (arg0: number) => void; json: (arg0: { message: string }) => any },
) => res(ctx.status(401), ctx.json({ message: 'bad request' }));

export const getProfileWithoutPhoto = (
  req: any,
  res: (arg0: any, arg1: any) => any,
  ctx: { status: (arg0: number) => any; json: (arg0: undefined) => any },
) => res(ctx.status(200), ctx.json(undefined));
