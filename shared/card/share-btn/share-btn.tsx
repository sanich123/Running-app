import { useCallback, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';
import type { View } from 'react-native';
import { IconButton, Portal, useTheme } from 'react-native-paper';
import { finishLoading, startLoading } from '@R/slices/loading/loading';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { errorToast } from '@S/error-toast/error-toast';
import { SHARE_BUTTON_TEXT } from './const';
import { useActivityCard } from '../context';
import ShareActivityImage from '../share-activity-image/share-activity-image';

function waitForShareImageRender() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

export default function ShareBtn() {
  const { activity } = useActivityCard();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { userId } = useAppSelector(({ auth }) => auth);
  const { isLoading } = useAppSelector(({ loading }) => loading);
  const isSharingDisabled = activity.profile?.allowActivitySharing === false && activity.userId !== userId;
  const isButtonDisabled = isLoading || isSharingDisabled;
  const dispatch = useAppDispatch();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const shareImageReadyRef = useRef<(() => void) | null>(null);
  const [isShareImageVisible, setIsShareImageVisible] = useState(false);

  const prepareShareImage = useCallback(
    () =>
      new Promise<void>((resolve) => {
        shareImageReadyRef.current = resolve;
        setIsShareImageVisible(true);
      }),
    [],
  );
  const handleShareImageReady = useCallback(() => {
    shareImageReadyRef.current?.();
    shareImageReadyRef.current = null;
  }, []);
  const cleanupShareImage = useCallback(() => {
    setIsShareImageVisible(false);
  }, []);

  return (
    <>
      {isShareImageVisible ? (
        <Portal>
          <ShareActivityImage
            distance={activity.distance}
            duration={activity.duration}
            date={activity.date}
            title={activity.title}
            mapPhotoUrl={activity.mapPhotoUrl}
            profile={activity.profile}
            sport={activity.sport}
            emotion={activity.emotion}
            elevationGain={activity.elevationGain}
            steps={activity.steps}
            locationName={activity.locationName}
            weatherTemperature={activity.weatherTemperature}
            weatherWindSpeed={activity.weatherWindSpeed}
            weatherCode={activity.weatherCode}
            caloriesActive={activity.caloriesActive}
            cardRef={cardRef}
            onReady={handleShareImageReady}
          />
        </Portal>
      ) : null}
      <IconButton
        onPress={async () => {
          dispatch(startLoading());
          try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
              await prepareShareImage();
              await waitForShareImageRender();
              const snapshot = await captureRef(
                cardRef as unknown as Parameters<typeof captureRef>[0],
                Platform.OS === 'web' ? { result: 'base64' } : {},
              );
              cleanupShareImage();
              await Sharing.shareAsync(snapshot);
            } else if (Platform.OS === 'web') {
              errorToast(SHARE_BUTTON_TEXT[language].webUnavailable);
            } else {
              errorToast(SHARE_BUTTON_TEXT[language].deviceUnavailable);
            }
          } catch (error) {
            errorToast('', error);
          } finally {
            cleanupShareImage();
            dispatch(finishLoading());
          }
        }}
        testID="iconShareBtn"
        icon="share-outline"
        iconColor={colors.primary}
        size={25}
        disabled={isButtonDisabled}
      />
    </>
  );
}
