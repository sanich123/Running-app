import { useEffect, useRef, useState } from 'react';
import { STATUSES } from '@const/enums';
import {
  restoreLocationsFromJournal,
  restoreTrackingMetrics,
  setActivityStatus,
  setEmptyLastArrayWhenPaused,
  setIsAppShuted,
  setSteps,
  stopDurationTimer,
} from '@R/slices/location/location';
import { clearTrackingRecovery, setTrackingRecoveryStatus } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { getAndStoreInitialPosition } from '@U/get-initial-position';
import useActivityDurationTimer from '@U/hooks/use-activity-duration-timer';
import { stopLocationTracking } from '@U/location/expo-task-manager/background-location';
import { markLocationJournalPause, readLocationJournal } from '@U/location/location-journal';
import { pausePedometerActivity, subscribePedometerSteps } from '@U/pedometer/pedometer';

export default function useActivityTrackingLifecycle(isLocationReadyForRecording: boolean) {
  const dispatch = useAppDispatch();
  const {
    status: recoveryStatus,
    journalId: recoveryJournalId,
    metrics: recoveryMetrics,
  } = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const initialRecovery = useRef({ status: recoveryStatus, journalId: recoveryJournalId, metrics: recoveryMetrics });
  const hydratedJournalId = useRef<string | null>(null);
  const [isRecoveringTracking, setIsRecoveringTracking] = useState(
    () => recoveryStatus === STATUSES.started || recoveryStatus === STATUSES.continued,
  );
  const didPauseRecoveredTracking = useRef(false);
  const initialPositionRequestInProgress = useRef(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    if (!isLocationReadyForRecording || initialPositionRequestInProgress.current) return;

    initialPositionRequestInProgress.current = true;
    let isMounted = true;
    setIsLocationLoading(true);
    void getAndStoreInitialPosition().finally(() => {
      initialPositionRequestInProgress.current = false;
      if (isMounted) setIsLocationLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isLocationReadyForRecording]);

  useEffect(() => {
    const recovery = initialRecovery.current;
    if (
      !recovery.journalId ||
      recovery.status === STATUSES.initial ||
      hydratedJournalId.current === recovery.journalId
    ) {
      return;
    }

    const snapshot = readLocationJournal(recovery.journalId);
    if (!snapshot) {
      dispatch(clearTrackingRecovery());
      return;
    }

    hydratedJournalId.current = recovery.journalId;
    dispatch(restoreTrackingMetrics(recovery.metrics));
    dispatch(
      restoreLocationsFromJournal({
        locationsFromBackground: snapshot.locations,
        locationsWithPauses: snapshot.segments,
      }),
    );
    dispatch(setActivityStatus(recovery.status));
  }, [dispatch]);

  useEffect(() => subscribePedometerSteps((steps) => dispatch(setSteps(steps))), [dispatch]);

  useEffect(() => {
    if (!isRecoveringTracking || didPauseRecoveredTracking.current) {
      return;
    }

    didPauseRecoveredTracking.current = true;
    const recoveryJournalIdAtLaunch = initialRecovery.current.journalId;
    if (!recoveryJournalIdAtLaunch) return;

    stopLocationTracking()
      .then(async () => {
        await pausePedometerActivity();
        dispatch(stopDurationTimer());
        setIsRecoveringTracking(false);
        markLocationJournalPause(recoveryJournalIdAtLaunch);
        dispatch(setTrackingRecoveryStatus(STATUSES.paused));
        dispatch(setActivityStatus(STATUSES.paused));
        dispatch(setEmptyLastArrayWhenPaused());
        dispatch(setIsAppShuted(true));
      })
      .catch((error: unknown) => errorToast('Не удалось поставить отслеживание на паузу', error));
  }, [dispatch, isRecoveringTracking]);

  useActivityDurationTimer(!isRecoveringTracking);

  return { isLocationLoading };
}
