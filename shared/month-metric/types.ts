export interface MonthMetricsProps {
  title: string;
  metric: string | number;
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  postfix: string;
}
