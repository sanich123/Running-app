import { HttpResponse } from 'msw';

export const likeToActivitySucces = () => HttpResponse.json([{ authorId: 'someUserId' }]);

export const postLikeSuccess = () => HttpResponse.json([{ authorId: 'someUserId' }], { status: 201 });
