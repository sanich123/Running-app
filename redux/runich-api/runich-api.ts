import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '@const/api-url';
import { API_NAME, LIMIT_OF_REQUEST, Tags } from './const';

export const runichApi = createApi({
  reducerPath: API_NAME,
  tagTypes: [Tags.activities, Tags.profile, Tags.comments, Tags.likes, Tags.friends, Tags.users, Tags.commentLikes],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    timeout: LIMIT_OF_REQUEST,
    prepareHeaders: async (headers, { endpoint }) => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken && !['registerUser', 'loginUser'].includes(endpoint)) {
        headers.set('authorization', `Bearer ${accessToken}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
