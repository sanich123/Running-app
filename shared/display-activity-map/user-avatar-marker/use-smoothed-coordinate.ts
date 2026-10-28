import { useEffect, useRef, useState } from 'react';
import { getLocationAnimationDuration } from '@U/location/location-utils';

type Coordinate = [number, number];

export function interpolateCoordinate(start: Coordinate, target: Coordinate, progress: number): Coordinate {
  const easedProgress = 1 - (1 - progress) ** 3;
  return [start[0] + (target[0] - start[0]) * easedProgress, start[1] + (target[1] - start[1]) * easedProgress];
}

export default function useSmoothedCoordinate(
  coordinate: Coordinate,
  timestamp: number | undefined,
  isEnabled: boolean,
): Coordinate {
  const [smoothedCoordinate, setSmoothedCoordinate] = useState<Coordinate>(coordinate);
  const currentCoordinateRef = useRef<Coordinate>(coordinate);
  const previousTimestampRef = useRef<number | null>(timestamp ?? null);
  const frameRef = useRef<number | null>(null);
  const [longitude, latitude] = coordinate;

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const targetCoordinate: Coordinate = [longitude, latitude];
    const durationMs = isEnabled ? getLocationAnimationDuration(previousTimestampRef.current, timestamp) : 0;
    previousTimestampRef.current = timestamp ?? previousTimestampRef.current;
    if (durationMs <= 0) {
      currentCoordinateRef.current = targetCoordinate;
      return;
    }

    const startCoordinate = currentCoordinateRef.current;
    if (startCoordinate[0] === longitude && startCoordinate[1] === latitude) {
      return;
    }

    let startedAt: number | null = null;
    const animate = (frameTime: number) => {
      startedAt ??= frameTime;
      const progress = Math.min((frameTime - startedAt) / durationMs, 1);
      const nextCoordinate = interpolateCoordinate(startCoordinate, targetCoordinate, progress);

      currentCoordinateRef.current = nextCoordinate;
      setSmoothedCoordinate(nextCoordinate);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isEnabled, latitude, longitude, timestamp]);

  return smoothedCoordinate;
}
