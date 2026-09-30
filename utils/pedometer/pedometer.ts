import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import type { ActivityKilometreSplit } from '@S/card/types';

export interface PedometerSample {
  timestamp: number;
  steps: number;
}

export interface PedometerActivityData {
  steps: number;
  samples: PedometerSample[];
}

type StepsListener = (steps: number) => void;
type PedometerSubscription = ReturnType<typeof Pedometer.watchStepCount>;

let subscription: PedometerSubscription | null = null;
let activityStartTimestamp: number | null = null;
let activeSegmentStartTimestamp: number | null = null;
let subscriptionBaseSteps = 0;
let totalSteps = 0;
let androidLatestSubscriptionSteps = 0;
let androidSegmentStartSteps = 0;
let androidSegmentBaseSteps = 0;
let samples: PedometerSample[] = [];
const listeners = new Set<StepsListener>();

function notifySteps() {
  listeners.forEach((listener) => listener(totalSteps));
}

function addSample(timestamp: number, steps: number) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(steps)) return;

  const normalizedSteps = Math.max(0, Math.round(steps));
  totalSteps = Math.max(totalSteps, normalizedSteps);
  const previousSample = samples[samples.length - 1];
  if (previousSample?.timestamp === timestamp) {
    previousSample.steps = totalSteps;
  } else {
    samples.push({ timestamp, steps: totalSteps });
  }
  notifySteps();
}

function removeSubscription() {
  subscription?.remove();
  subscription = null;
}

async function stopActiveSegment(keepAndroidSubscription = false) {
  const segmentStart = activeSegmentStartTimestamp;
  activeSegmentStartTimestamp = null;
  const shouldKeepAndroidSubscription = keepAndroidSubscription && Platform.OS === 'android';
  if (!shouldKeepAndroidSubscription) removeSubscription();

  if (!segmentStart) return;

  const endTimestamp = Date.now();
  if (Platform.OS === 'ios') {
    try {
      const result = await Pedometer.getStepCountAsync(new Date(segmentStart), new Date(endTimestamp));
      addSample(endTimestamp, subscriptionBaseSteps + result.steps);
    } catch {
      // Android does not support date-range queries and some devices expose no history.
      addSample(endTimestamp, totalSteps);
    }
  } else {
    addSample(endTimestamp, totalSteps);
  }
}

async function startSegment() {
  if (Platform.OS === 'web') return false;

  if (subscription) {
    const now = Date.now();
    activityStartTimestamp ??= now;
    activeSegmentStartTimestamp = now;
    if (Platform.OS === 'android') {
      // Expo's Android sensor reports a cumulative count for the lifetime of
      // this subscription. Keep it alive across pauses and offset paused steps
      // when recording resumes, instead of creating a fresh count starting at 1.
      androidSegmentBaseSteps = totalSteps;
      androidSegmentStartSteps = androidLatestSubscriptionSteps;
    }
    addSample(now, totalSteps);
    return true;
  }

  try {
    if (!(await Pedometer.isAvailableAsync())) return false;

    const currentPermission = await Pedometer.getPermissionsAsync();
    const permission = currentPermission.granted ? currentPermission : await Pedometer.requestPermissionsAsync();
    if (!permission.granted) return false;

    const now = Date.now();
    activityStartTimestamp ??= now;
    activeSegmentStartTimestamp = now;
    subscriptionBaseSteps = totalSteps;
    androidLatestSubscriptionSteps = 0;
    androidSegmentStartSteps = 0;
    androidSegmentBaseSteps = totalSteps;
    addSample(now, totalSteps);
    subscription = Pedometer.watchStepCount(({ steps }) => {
      if (Platform.OS === 'android') {
        androidLatestSubscriptionSteps = Math.max(androidLatestSubscriptionSteps, Math.max(0, Math.round(steps)));
        if (activeSegmentStartTimestamp === null) return;

        const activeSegmentSteps = Math.max(0, androidLatestSubscriptionSteps - androidSegmentStartSteps);
        addSample(Date.now(), androidSegmentBaseSteps + activeSegmentSteps);
        return;
      }

      const currentSteps = subscriptionBaseSteps + Math.max(0, Math.round(steps));
      addSample(Date.now(), currentSteps);
    });
    return true;
  } catch {
    return false;
  }
}

export async function startPedometerActivity() {
  resetPedometerActivity();
  return startSegment();
}

export async function resumePedometerActivity() {
  return startSegment();
}

export async function pausePedometerActivity(): Promise<PedometerActivityData> {
  await stopActiveSegment(true);
  return getPedometerActivityData();
}

export async function finishPedometerActivity(): Promise<PedometerActivityData> {
  await stopActiveSegment();
  const result = getPedometerActivityData();
  resetPedometerActivity();
  return result;
}

export function getPedometerActivityData(): PedometerActivityData {
  return { steps: totalSteps, samples: samples.map((sample) => ({ ...sample })) };
}

export function resetPedometerActivity() {
  removeSubscription();
  activityStartTimestamp = null;
  activeSegmentStartTimestamp = null;
  subscriptionBaseSteps = 0;
  totalSteps = 0;
  androidLatestSubscriptionSteps = 0;
  androidSegmentStartSteps = 0;
  androidSegmentBaseSteps = 0;
  samples = [];
  notifySteps();
}

export function subscribePedometerSteps(listener: StepsListener) {
  listeners.add(listener);
  listener(totalSteps);
  return () => {
    listeners.delete(listener);
  };
}

function getStepsAtTimestamp(timestamp: number, pedometerSamples: PedometerSample[]) {
  if (!pedometerSamples.length) return 0;
  if (timestamp <= pedometerSamples[0].timestamp) return pedometerSamples[0].steps;

  for (let index = 1; index < pedometerSamples.length; index += 1) {
    const previous = pedometerSamples[index - 1];
    const current = pedometerSamples[index];
    if (timestamp > current.timestamp) continue;
    if (current.timestamp <= previous.timestamp) return current.steps;

    const fraction = (timestamp - previous.timestamp) / (current.timestamp - previous.timestamp);
    return previous.steps + (current.steps - previous.steps) * fraction;
  }

  return pedometerSamples[pedometerSamples.length - 1].steps;
}

export function getStepsForKilometreSplits(
  kilometreSplits: ActivityKilometreSplit[],
  pedometerData: PedometerActivityData,
) {
  let previousSteps = pedometerData.samples[0]?.steps ?? 0;

  return kilometreSplits.map((split) => {
    const timestamp = split.kilometerPoint.timestamp ?? split.kilometerPoint.coords.timestamp;
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return 0;

    const stepsAtSplit = Math.max(previousSteps, getStepsAtTimestamp(timestamp, pedometerData.samples));
    const splitSteps = Math.max(0, Math.round(stepsAtSplit - previousSteps));
    previousSteps = stepsAtSplit;
    return splitSteps;
  });
}
