import { Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { CurrentWeekStatisticsRequest, MonthStatisticsRequest } from './types';

const { statistics } = Routes;

const statisticsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnnualStatisticsByUserId: builder.query({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/year-category`,
      }),
      providesTags: [Tags.activities],
    }),

    getCurrentWeekStatistics: builder.query({
      query: ({ userId, firstDay, lastDay }: CurrentWeekStatisticsRequest) => ({
        url: `/${statistics}/${userId}/week?firstDay=${firstDay}&lastDay=${lastDay}`,
      }),
      providesTags: [Tags.activities],
    }),

    getAllTimeStatisticsByUserId: builder.query({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/all`,
      }),
      providesTags: [Tags.activities],
    }),

    getMonthStatistics: builder.query({
      query: ({ userId, year, month }: MonthStatisticsRequest) => ({
        url: `/${statistics}/${userId}/year-month?year=${year}&month=${month}`,
      }),
      providesTags: [Tags.activities],
    }),
  }),
});

export const {
  useGetAnnualStatisticsByUserIdQuery,
  useGetCurrentWeekStatisticsQuery,
  useGetAllTimeStatisticsByUserIdQuery,
  useGetMonthStatisticsQuery,
} = statisticsApi;
