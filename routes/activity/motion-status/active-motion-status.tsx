import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { useAppSelector } from '@R/typed-hooks';
import { ACCELEROMETER_UPDATE_INTERVAL } from '@U/motion/const';
import { createMotionStatusDetector } from '@U/motion/motion-detector';
import { getPedometerActivityData } from '@U/pedometer/pedometer';
import { ACTIVITY_MOTION_STATUS } from './const';
import { getMotionSourcesLabel } from './utils';
import type { LANGUAGES } from '@const/enums';
import type { MotionSource } from '@U/motion/types';

export default function ActiveMotionStatus({ language }: { language: LANGUAGES }) {
  const { colors } = useTheme();
  const { lastPosition, steps } = useAppSelector(({ location }) => location);
  const [restingSources, setRestingSources] = useState<MotionSource[]>([]);
  const lastPositionRef = useRef(lastPosition);
  const stepsRef = useRef(steps);

  useEffect(() => {
    lastPositionRef.current = lastPosition;
  }, [lastPosition]);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    const detector = createMotionStatusDetector();
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    try {
      Accelerometer.setUpdateInterval(ACCELEROMETER_UPDATE_INTERVAL);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const pedometerData = getPedometerActivityData();
        const result = detector.update({
          timestamp: Date.now(),
          acceleration: { x, y, z },
          location: lastPositionRef.current,
          pedometerSteps: stepsRef.current,
          pedometerAvailable: pedometerData.samples.length > 0,
        });
        setRestingSources(result.status === 'resting' ? result.restingSources : []);
      });
    } catch {
      return () => detector.reset();
    }

    return () => {
      subscription?.remove();
      detector.reset();
    };
  }, []);

  if (!restingSources.length) {
    return null;
  }

  const sources = getMotionSourcesLabel(restingSources, ACTIVITY_MOTION_STATUS[language].sources);

  return (
    <View style={[styles.message, { backgroundColor: colors.secondaryContainer, borderColor: colors.outlineVariant }]}>
      <Icon source="motion-sensor" size={22} color={colors.secondary} />
      <View style={styles.messageContent}>
        <Text variant="titleSmall" style={{ color: colors.onSecondaryContainer }}>
          {ACTIVITY_MOTION_STATUS[language].title}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {ACTIVITY_MOTION_STATUS[language].description}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {ACTIVITY_MOTION_STATUS[language].basedOn(sources)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    alignItems: 'flex-start',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageContent: { flex: 1, gap: 3 },
});
