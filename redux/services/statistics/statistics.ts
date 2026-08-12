import { Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { CurrentWeekStatisticsRequest, MonthStatisticsRequest } from './types';
import type { MonthStatisticsResponse, StatisticMetricResponse, YearStatisticsResponse } from '@R/runich-api/types';

const { statistics } = Routes;

const statisticsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnnualStatisticsByUserId: builder.query<YearStatisticsResponse, { userId: string }>({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/year-category`,
      }),
      providesTags: [Tags.activities],
    }),

    getCurrentWeekStatistics: builder.query<StatisticMetricResponse, CurrentWeekStatisticsRequest>({
      query: ({ userId, firstDay, lastDay }: CurrentWeekStatisticsRequest) => ({
        url: `/${statistics}/${userId}/week?firstDay=${firstDay}&lastDay=${lastDay}`,
      }),
      providesTags: [Tags.activities],
    }),

    getAllTimeStatisticsByUserId: builder.query<StatisticMetricResponse, { userId: string }>({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/all`,
      }),
      providesTags: [Tags.activities],
    }),

    getMonthStatistics: builder.query<MonthStatisticsResponse, MonthStatisticsRequest>({
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
