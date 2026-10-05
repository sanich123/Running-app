import { Routes, Tags } from '@R/runich-api/const';
import { createSearchParams } from '@R/runich-api/create-search-params';
import { runichApi } from '@R/runich-api/runich-api';
import { getDeviceTimeZone } from '@U/time-zone';
import type { CurrentWeekStatisticsRequest, MonthStatisticsRequest } from './types';
import type { MonthStatisticsResponse, StatisticMetricResponse, YearStatisticsResponse } from '@R/runich-api/types';

const { statistics } = Routes;

const statisticsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnnualStatisticsByUserId: builder.query<YearStatisticsResponse, { userId: string; timeZone?: string }>({
      query: ({ userId, timeZone = getDeviceTimeZone() }) => ({
        url: `/${statistics}/${userId}/year-category${createSearchParams({ timeZone })}`,
      }),
      providesTags: [Tags.statistics],
    }),

    getCurrentWeekStatistics: builder.query<StatisticMetricResponse, CurrentWeekStatisticsRequest>({
      query: ({ userId, firstDay, lastDay, timeZone = getDeviceTimeZone() }: CurrentWeekStatisticsRequest) => ({
        url: `/${statistics}/${userId}/week${createSearchParams({ firstDay, lastDay, timeZone })}`,
      }),
      providesTags: [Tags.statistics],
    }),

    getAllTimeStatisticsByUserId: builder.query<StatisticMetricResponse, { userId: string }>({
      query: ({ userId }: { userId: string }) => ({
        url: `/${statistics}/${userId}/all`,
      }),
      providesTags: [Tags.statistics],
    }),

    getMonthStatistics: builder.query<MonthStatisticsResponse, MonthStatisticsRequest>({
      query: ({ userId, year, month, timeZone = getDeviceTimeZone() }: MonthStatisticsRequest) => ({
        url: `/${statistics}/${userId}/year-month${createSearchParams({ year, month, timeZone })}`,
      }),
      providesTags: [Tags.statistics],
    }),
  }),
});

export const {
  useGetAnnualStatisticsByUserIdQuery,
  useGetCurrentWeekStatisticsQuery,
  useGetAllTimeStatisticsByUserIdQuery,
  useGetMonthStatisticsQuery,
} = statisticsApi;
