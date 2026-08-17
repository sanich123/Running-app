import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from './emotion-btns/const';

export type ManualActivityMode = 'manual' | 'tracked' | 'edit';

interface ManualActivitySearchParams {
  id?: string | string[];
  mode?: ManualActivityMode | string | string[];
  cameraVisible?: string | string[];
  manualDate?: string | string[];
  manualDistance?: string | string[];
  manualHours?: string | string[];
  manualMinutes?: string | string[];
  manualSeconds?: string | string[];
  title?: string | string[];
  description?: string | string[];
  sport?: string | string[];
  emotion?: string | string[];
  isPublic?: string | string[];
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getManualActivityParams(params: ManualActivitySearchParams) {
  const mode = getFirstParam(params.mode);

  return {
    activityId: getFirstParam(params.id),
    mode,
    isEditingActivity: mode === 'edit',
    isManualAdding: mode === 'manual',
    isCameraVisible: getFirstParam(params.cameraVisible) === 'true',
    manualDate: getFirstParam(params.manualDate) ?? new Date().toISOString(),
    manualDistance: getFirstParam(params.manualDistance) ?? '0',
    manualHours: getFirstParam(params.manualHours) ?? '0',
    manualMinutes: getFirstParam(params.manualMinutes) ?? '0',
    manualSeconds: getFirstParam(params.manualSeconds) ?? '0',
    title: getFirstParam(params.title) ?? '',
    description: getFirstParam(params.description) ?? '',
    sport: (getFirstParam(params.sport) ?? SPORTS_BTNS_VALUES.run) as SPORTS_BTNS_VALUES,
    emotion: (getFirstParam(params.emotion) ?? EMOTIONS_BTNS_VALUES.normal) as EMOTIONS_BTNS_VALUES,
    isPublic: getFirstParam(params.isPublic) !== 'false',
  };
}

export function useManualActivityParams() {
  const params = useLocalSearchParams() as ManualActivitySearchParams;

  return getManualActivityParams(params);
}

export function useGlobalManualActivityParams() {
  const params = useGlobalSearchParams() as ManualActivitySearchParams;

  return getManualActivityParams(params);
}

export function useSetManualActivityParams() {
  const { setParams } = useRouter();

  return {
    setCameraIsVisible: (isVisible: boolean) => setParams({ cameraVisible: String(isVisible) }),
    setManualDate: (date: Date) => setParams({ manualDate: date.toISOString() }),
    setManualDistance: (distance: string) => setParams({ manualDistance: distance }),
    setManualHours: (hours: string) => setParams({ manualHours: hours }),
    setManualMinutes: (minutes: string) => setParams({ manualMinutes: minutes }),
    setManualSeconds: (seconds: string) => setParams({ manualSeconds: seconds }),
    setTitle: (title: string) => setParams({ title }),
    setDescription: (description: string) => setParams({ description }),
    setSport: (sport: string) => setParams({ sport }),
    setEmotion: (emotion: string) => setParams({ emotion }),
    setIsPublic: (isPublic: boolean) => setParams({ isPublic: String(isPublic) }),
  };
}
