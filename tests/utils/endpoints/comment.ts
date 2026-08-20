import { HttpResponse } from 'msw';
import { MOCK_COMMENT_LIKES } from '@T/mocks/mock-comment-likes';
import { MOCK_COMMENTS } from '@T/mocks/mock-comments';

export const successLikeToComment = () => HttpResponse.json(MOCK_COMMENT_LIKES);

export const successGetComments = () =>
  HttpResponse.json({ comments: MOCK_COMMENTS, hasMore: false, nextCursor: null });

export const successGetOneComment = () =>
  HttpResponse.json({ comments: MOCK_COMMENTS.slice(0, 1), hasMore: false, nextCursor: null });

export const successGetTwoComment = () =>
  HttpResponse.json({ comments: MOCK_COMMENTS.slice(0, 2), hasMore: false, nextCursor: null });

export const getCommentsFailure = () => HttpResponse.json({ message: 'Bad request' }, { status: 401 });
