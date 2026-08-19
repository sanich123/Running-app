import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { SPORTS_BTNS_VALUES } from '@const/sports';

interface ActivitySearchParams {
  sport?: string | string[];
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSport(value: string | string[] | undefined) {
  return (getFirstParam(value) ?? SPORTS_BTNS_VALUES.run) as SPORTS_BTNS_VALUES;
}

export function useActivitySportParams() {
  const { sport } = useLocalSearchParams() as ActivitySearchParams;

  return { sport: getSport(sport) };
}

export function useGlobalActivitySportParams() {
  const { sport } = useGlobalSearchParams() as ActivitySearchParams;

  return { sport: getSport(sport) };
}

export function useSetActivitySportParams() {
  const { setParams } = useRouter();

  return { setSport: (sport: string) => setParams({ sport }) };
}
