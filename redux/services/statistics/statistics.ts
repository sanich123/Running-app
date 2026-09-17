import { Routes, Tags } from '@R/runich-api/const';
import { runichApi } from '@R/runich-api/runich-api';
import type { CurrentWeekStatisticsRequest, MonthStatisticsRequest } from './types';
import type { MonthStatisticsResponse, StatisticMetricResponse, YearStatisticsResponse } from '@R/runich-api/types';
import { getDeviceTimeZone } from '@U/time-zone';

const { statistics } = Routes;

const statisticsApi = runichApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAnnualStatisticsByUserId: builder.query<YearStatisticsResponse, { userId: string; timeZone?: string }>({
      query: ({ userId, timeZone = getDeviceTimeZone() }) => ({
        url: `/${statistics}/${userId}/year-category?timeZone=${encodeURIComponent(timeZone)}`,
      }),
      providesTags: [Tags.statistics],
    }),

    getCurrentWeekStatistics: builder.query<StatisticMetricResponse, CurrentWeekStatisticsRequest>({
      query: ({ userId, firstDay, lastDay, timeZone = getDeviceTimeZone() }: CurrentWeekStatisticsRequest) => ({
        url: `/${statistics}/${userId}/week?firstDay=${encodeURIComponent(firstDay)}&lastDay=${encodeURIComponent(lastDay)}&timeZone=${encodeURIComponent(timeZone)}`,
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
        url: `/${statistics}/${userId}/year-month?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}&timeZone=${encodeURIComponent(timeZone)}`,
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
