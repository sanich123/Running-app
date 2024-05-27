export const headers = { 'Content-type': 'application/json' };

export enum Tags {
  activities = 'activities',
  profile = 'profile',
  comments = 'comments',
  commentLikes = 'commentLikes',
  likes = 'likes',
  friends = 'friends',
  users = 'users',
}

export enum Methods {
  post = 'POST',
  delete = 'DELETE',
  patch = 'PATCH',
}

export enum Routes {
  user = 'user',
  profile = 'profile',
  activity = 'activity',
  friend = 'friend',
  comment = 'comment',
  like = 'like',
  auth = 'auth',
  activityId = 'activityId',
  all = 'all',
  photos = 'photos',
  followers = 'followers',
}

export const API_NAME = 'runnichApi';
export const LIMIT_OF_REQUEST = 25000;
