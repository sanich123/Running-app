export const headers = { 'Content-type': 'application/json' };

export const TAGS = {
  activities: 'activities',
  profile: 'profile',
  comments: 'comments',
  likes: 'likes',
  friends: 'friends',
  users: 'users',
} as const;

export const BASE_URL = 'https://runich-backend.onrender.com';

export const ROUTES = {
  user: 'user',
  profile: 'profile',
  activity: 'activity',
  friend: 'friend',
  comment: 'comment',
  like: 'like',
  auth: 'auth',
  signIn: 'signin',
  signUp: 'signup',
  activityId: 'activityId',
} as const;
