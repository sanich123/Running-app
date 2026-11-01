import { setNavigationAlertsMuted } from '@R/slices/settings/settings';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import MapControlButton from '@S/map-control-button/map-control-button';
import { NAVIGATION_SETTINGS_COPY } from '../const';

export default function NavigationAlertsMuteButton() {
  const dispatch = useAppDispatch();
  const { language, navigationAlertsMuted } = useAppSelector(({ settings }) => settings);
  const labels = NAVIGATION_SETTINGS_COPY[language];

  return (
    <MapControlButton
      testID="navigation-alerts-mute-button"
      androidIcon={navigationAlertsMuted ? 'volume-off' : 'volume-high'}
      iosSymbol={navigationAlertsMuted ? 'speaker.slash' : 'speaker.wave.2'}
      accessibilityLabel={navigationAlertsMuted ? labels.unmute : labels.mute}
      onPress={() => dispatch(setNavigationAlertsMuted(!navigationAlertsMuted))}
    />
  );
}
