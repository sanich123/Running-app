import { useGlobalSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { ACTIVITY_VISIBILITY, type ActivityVisibility } from '@const/activity-visibility';
import { ACTIVITY_INPUT_LIMITS, limitText } from '@const/input-limits';
import { SPORTS_BTNS_VALUES } from '@const/sports';
import { EMOTIONS_BTNS_VALUES } from './emotion-btns/const';

type ManualActivityMode = 'manual' | 'tracked' | 'edit';

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
  visibility?: string | string[];
  hideMap?: string | string[];
  hasMapPhoto?: string | string[];
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getManualDate(value: string | string[] | undefined, mode: string | undefined) {
  const date = getFirstParam(value);
  const now = new Date();

  if (!date) return now.toISOString();
  if (mode !== 'manual') return date;

  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate > now ? now.toISOString() : date;
}

function getActivityVisibility(value: string | string[] | undefined): ActivityVisibility {
  const visibility = getFirstParam(value);
  return visibility === ACTIVITY_VISIBILITY.public ||
    visibility === ACTIVITY_VISIBILITY.followers ||
    visibility === ACTIVITY_VISIBILITY.private
    ? visibility
    : ACTIVITY_VISIBILITY.followers;
}

function getManualActivityParams(params: ManualActivitySearchParams) {
  const mode = getFirstParam(params.mode);

  return {
    activityId: getFirstParam(params.id),
    mode,
    isEditingActivity: mode === 'edit',
    isManualAdding: mode === 'manual',
    isCameraVisible: getFirstParam(params.cameraVisible) === 'true',
    manualDate: getManualDate(params.manualDate, mode),
    manualDistance: getFirstParam(params.manualDistance) ?? '0',
    manualHours: getFirstParam(params.manualHours) ?? '0',
    manualMinutes: getFirstParam(params.manualMinutes) ?? '0',
    manualSeconds: getFirstParam(params.manualSeconds) ?? '0',
    title: limitText(getFirstParam(params.title) ?? '', ACTIVITY_INPUT_LIMITS.title),
    description: limitText(getFirstParam(params.description) ?? '', ACTIVITY_INPUT_LIMITS.description),
    sport: (getFirstParam(params.sport) ?? SPORTS_BTNS_VALUES.run) as SPORTS_BTNS_VALUES,
    emotion: (getFirstParam(params.emotion) ?? EMOTIONS_BTNS_VALUES.normal) as EMOTIONS_BTNS_VALUES,
    visibility: getActivityVisibility(params.visibility),
    hideMap: getFirstParam(params.hideMap) === 'true',
    hasMapPhoto: getFirstParam(params.hasMapPhoto) === 'true',
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
    setTitle: (title: string) => setParams({ title: limitText(title, ACTIVITY_INPUT_LIMITS.title) }),
    setDescription: (description: string) =>
      setParams({ description: limitText(description, ACTIVITY_INPUT_LIMITS.description) }),
    setSport: (sport: string) => setParams({ sport }),
    setEmotion: (emotion: string) => setParams({ emotion }),
    setVisibility: (visibility: ActivityVisibility) => setParams({ visibility }),
    setHideMap: (hideMap: boolean) => setParams({ hideMap: String(hideMap) }),
  };
}
