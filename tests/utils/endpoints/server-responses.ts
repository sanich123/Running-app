import { HttpResponse } from 'msw';
import {
  MOCK_SERVER_ACTIVITIES,
  MOCK_SERVER_ACTIVITY,
  MOCK_SERVER_COMMENTS,
  MOCK_SERVER_COMMENT_LIKES,
  MOCK_SERVER_ERROR,
  MOCK_SERVER_FOLLOWERS,
  MOCK_SERVER_FOLLOWINGS,
  MOCK_SERVER_LIKES,
  MOCK_SERVER_LOCATIONS,
  MOCK_SERVER_PHOTOS,
  MOCK_SERVER_PROFILE,
  MOCK_SERVER_STATISTICS,
  MOCK_SERVER_USERS,
} from '@T/responses/runich';

export const getServerProfile = () => HttpResponse.json(MOCK_SERVER_PROFILE);
export const getServerActivity = () => HttpResponse.json(MOCK_SERVER_ACTIVITY);
export const getServerActivities = () => HttpResponse.json(MOCK_SERVER_ACTIVITIES);
export const getServerLocations = () => HttpResponse.json(MOCK_SERVER_LOCATIONS);
export const getServerPhotos = () => HttpResponse.json(MOCK_SERVER_PHOTOS);
export const getServerLikes = () => HttpResponse.json(MOCK_SERVER_LIKES);
export const getServerComments = () => HttpResponse.json(MOCK_SERVER_COMMENTS);
export const getServerCommentLikes = () => HttpResponse.json(MOCK_SERVER_COMMENT_LIKES);
export const getServerFollowings = () => HttpResponse.json(MOCK_SERVER_FOLLOWINGS);
export const getServerFollowers = () => HttpResponse.json(MOCK_SERVER_FOLLOWERS);
export const getServerUsers = () => HttpResponse.json(MOCK_SERVER_USERS);
export const getServerAllStatistics = () => HttpResponse.json(MOCK_SERVER_STATISTICS.all);
export const getServerWeekStatistics = () => HttpResponse.json(MOCK_SERVER_STATISTICS.week);
export const getServerMonthStatistics = () => HttpResponse.json(MOCK_SERVER_STATISTICS.month);
export const getServerYearStatistics = () => HttpResponse.json(MOCK_SERVER_STATISTICS.year);
export const getServerError = () => HttpResponse.json(MOCK_SERVER_ERROR, { status: 500 });
