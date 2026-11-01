import MapControls from '@S/display-activity-map/map-controls/map-controls';
import PlaybackDurationMenu from './playback-duration-menu/playback-duration-menu';
import type { MapToolsProps } from '../types';

export default function MapTools({
  mapStyle,
  playbackDuration,
  copy,
  onZoomIn,
  onZoomOut,
  onMapStyleChange,
  onSetPlaybackDuration,
  canZoomIn,
  canZoomOut,
  bottomOffset,
  isDisabled = false,
}: MapToolsProps) {
  return (
    <MapControls
      mapStyle={mapStyle}
      copy={copy}
      onZoomIn={onZoomIn}
      onZoomOut={onZoomOut}
      onMapStyleChange={onMapStyleChange}
      canZoomIn={canZoomIn}
      canZoomOut={canZoomOut}
      bottomOffset={bottomOffset}
      isDisabled={isDisabled}
      testIdPrefix="activity-route-replay">
      <PlaybackDurationMenu
        playbackDuration={playbackDuration}
        copy={copy}
        isDisabled={isDisabled}
        onSelect={onSetPlaybackDuration}
      />
    </MapControls>
  );
}
