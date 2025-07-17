import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_NAME, LIMIT_OF_REQUEST, Tags } from './const';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users, Tags.commentLikes],
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_BASE_URL,
    timeout: LIMIT_OF_REQUEST,
    prepareHeaders: async (headers, { endpoint }) => {
      const access = await AsyncStorage.getItem('accessToken');
      if (access && !['registerUser', 'loginUser'].includes(endpoint)) {
        headers.set('authorization', `Bearer ${access}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
