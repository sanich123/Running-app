import type { MapsPageCopy } from '../../const';
import type { ActivityDateFilters } from '../utils';

export interface DateFiltersProps {
  filters: ActivityDateFilters;
  availableFilters: { years: number[]; months: number[]; days: number[] };
  copy: MapsPageCopy;
  locale: string;
  onChange: (key: keyof ActivityDateFilters, value: number | null) => void;
}
