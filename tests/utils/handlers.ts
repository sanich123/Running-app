import { rest } from 'msw';

import {
  getActivityByActivityId,
  getAllActivitiesByUserId,
  getAllCtivitiesByUserIdFailure,
  getEmptyListActivitiesByUserId,
  getPhotosFromActivities,
  getPhotosFromActivitiesFailure,
  postActivityFailure,
  postActivitySuccess,
} from './endpoints/activity';
import {
  getCommentsFailure,
  successGetComments,
  successGetOneComment,
  successGetTwoComment,
  successLikeToComment,
} from './endpoints/comment';
import {
  addFriendSuccess,
  deleteFriendSuccess,
  getFollowersFailure,
  getFollowersSuccess,
  getFollowingsSuccess,
} from './endpoints/friend';
import { likeToActivitySucces, postLikeSuccess } from './endpoints/like';
import { getProfileFailure, getProfileSuccess, getProfileWithoutPhoto } from './endpoints/profile';
import { addUser } from './endpoints/user';

export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

export const handlers = [
  rest.post(`${BASE_URL}/activity/someUserId`, postActivitySuccess),
  rest.post(`${BASE_URL}/activity/someWrongUserId`, postActivityFailure),
  rest.get(`${BASE_URL}/activity/activityId/someActivityId`, getActivityByActivityId),
  rest.get(`${BASE_URL}/activity/someUserId/all`, getAllActivitiesByUserId),
  rest.get(`${BASE_URL}/activity/someUserIdWithEmptyFriendsActivities/all`, getEmptyListActivitiesByUserId),
  rest.get(`${BASE_URL}/activity/someIdThatRejectsWithAnError/all`, getAllCtivitiesByUserIdFailure),
  rest.get(`${BASE_URL}/activity/someUserId/photos`, getPhotosFromActivities),
  rest.get(`${BASE_URL}/activity/someWrongUserId/photos`, getPhotosFromActivitiesFailure),
  rest.get(`${BASE_URL}/profile/someUserId`, getProfileSuccess),
  rest.get(`${BASE_URL}/profile/926f4a53-08b5-43c6-99ee-cf31fdfbb49b`, getProfileSuccess),
  rest.get(`${BASE_URL}/profile/7857abb1-b125-4f39-becf-8f30216b46ec`, getProfileSuccess),
  rest.get(`${BASE_URL}/profile/a6135312-595f-4524-b3f3-496a05165d22`, getProfileSuccess),
  rest.get(`${BASE_URL}/profile/someUserIdWithAnError`, getProfileFailure),
  rest.get(`${BASE_URL}/profile/someUserIdWithoutPhoto`, getProfileWithoutPhoto),
  rest.get(`${BASE_URL}/like/someActivityId`, likeToActivitySucces),
  rest.get(`${BASE_URL}/like/617dddae-05b3-418a-9a8e-5d408a1b897a`, likeToActivitySucces),
  rest.get(`${BASE_URL}/like/e315eb5b-989c-4215-9d14-d77f4e7e2974`, likeToActivitySucces),
  rest.post(`${BASE_URL}/like`, postLikeSuccess),
  rest.get(`${BASE_URL}/comment/922dca27-f99c-4165-96d6-5a04bbb6e9cb/like`, successLikeToComment),
  rest.get(`${BASE_URL}/comment/2fd0916a-1fb8-44c4-bb6a-021c092f2713/like`, successLikeToComment),
  rest.get(`${BASE_URL}/comment/f8266ab2-c911-47a5-852f-2fd91b1c31c5/like`, successLikeToComment),
  rest.get(`${BASE_URL}/comment/189d2c10-463c-42f5-9f09-5e9fa6aa2720`, successGetComments),
  rest.get(`${BASE_URL}/comment/activityIdWithOneComment`, successGetOneComment),
  rest.get(`${BASE_URL}/comment/activityIdWithTwoComments`, successGetTwoComment),
  rest.get(`${BASE_URL}/comment/e315eb5b-989c-4215-9d14-d77f4e7e2974`, successGetComments),
  rest.get(`${BASE_URL}/comment/someActivityId`, successGetOneComment),
  rest.get(`${BASE_URL}/comment/someWrongActivityId`, getCommentsFailure),
  rest.delete(`${BASE_URL}/friend/0326e84a-946b-42da-b662-658c4c9a50d9`, deleteFriendSuccess),
  rest.post(`${BASE_URL}/friend/someFriendId`, addFriendSuccess),
  rest.get(`${BASE_URL}/friend/7857abb1-b125-4f39-becf-8f30216b46ec/followers`, getFollowersSuccess),
  rest.get(`${BASE_URL}/friend/926f4a53-08b5-43c6-99ee-cf31fdfbb49b`, getFollowingsSuccess),
  rest.get(`${BASE_URL}/friend/926f4a53-08b5-43c6-99ee-cf31fdfbb49b/followers`, getFollowersFailure),
  rest.post(`${BASE_URL}/user/someUserId/profile`, addUser),
];
