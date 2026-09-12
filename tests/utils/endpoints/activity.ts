import { HttpResponse } from 'msw';
import { MOCK_ACTIVITY } from '@T/mocks/mock-activity';
import { MOCK_PHOTOS } from '@T/mocks/mock-photos';
import { MOCK_BAD_REQUEST } from '@T/mocks/mock-requests';
import { MOCK_SERVER_PROFILE } from '@T/responses/runich';

export const postActivitySuccess = () => HttpResponse.json(MOCK_ACTIVITY, { status: 201 });

export const postActivityFailure = () =>
  HttpResponse.json(
    {
      error: 'Bad Request',
      message: ['Invalid activity'],
      statusCode: 400,
    },
    { status: 400 },
  );

export const getActivityByActivityId = () => HttpResponse.json(MOCK_ACTIVITY);

export const getAllActivitiesByUserId = () =>
  HttpResponse.json({
    activities: [MOCK_ACTIVITY],
    currentUserProfile: MOCK_SERVER_PROFILE,
    hasMore: false,
    nextCursor: null,
  });

export const getEmptyListActivitiesByUserId = () =>
  HttpResponse.json({ activities: [MOCK_ACTIVITY], hasMore: true, nextCursor: 'next-cursor' });

export const getAllCtivitiesByUserIdFailure = () => HttpResponse.json(MOCK_BAD_REQUEST, { status: 401 });

export const getPhotosFromActivities = () =>
  HttpResponse.json({ photos: MOCK_PHOTOS, hasMore: false, nextCursor: null });

export const getPhotosFromActivitiesFailure = () => HttpResponse.json(MOCK_BAD_REQUEST, { status: 400 });
