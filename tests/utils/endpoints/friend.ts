import { HttpResponse } from 'msw';
import { MOCK_FOLLOWERS } from '@T/mocks/mock-followers';
import { MOCK_FRIENDS } from '@T/mocks/mock-friends';
import { MOCK_LOCATION } from '@T/mocks/mock-location';

export const deleteFriendSuccess = () => new HttpResponse(null, { status: 204 });

export const addFriendSuccess = () => HttpResponse.json(MOCK_LOCATION, { status: 201 });

export const getFollowersSuccess = () => HttpResponse.json(MOCK_FOLLOWERS);

export const getFollowingsSuccess = () => HttpResponse.json(MOCK_FRIENDS);

export const getFollowersFailure = () => HttpResponse.json('FETCH_ERROR', { status: 400 });
