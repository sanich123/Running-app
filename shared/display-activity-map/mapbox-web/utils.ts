import { getActivityRouteReplayMapboxBrandingBottomOffset } from '@S/activity-route-replay/const';
import { getAvatarLabel } from '../../avatar/user-avatar/utils';
import type { ProfileType } from '@S/card/types';
import type { ExpressionSpecification, Map as MapboxMap, Popup as MapboxPopup } from 'mapbox-gl';

export function getRouteSpeedGradient(
  routeCoordinates: number[][],
  routeSegmentColors: string[],
): ExpressionSpecification | undefined {
  if (routeCoordinates.length < 2 || routeSegmentColors.length !== routeCoordinates.length - 1) return undefined;

  const projectedCoordinates = routeCoordinates.map(([longitude, latitude]) => {
    const boundedLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
    return [longitude * (Math.PI / 180), Math.log(Math.tan(Math.PI / 4 + boundedLatitude * (Math.PI / 360)))] as const;
  });
  const segmentLengths = projectedCoordinates
    .slice(1)
    .map((coordinate, index) =>
      Math.hypot(coordinate[0] - projectedCoordinates[index][0], coordinate[1] - projectedCoordinates[index][1]),
    );
  const totalLength = segmentLengths.reduce((total, length) => total + length, 0);
  if (totalLength === 0) return undefined;

  const gradient: ExpressionSpecification = ['interpolate', ['linear'], ['line-progress'], 0, routeSegmentColors[0]];
  let traversedLength = 0;
  let previousProgress = 0;

  routeSegmentColors.slice(1).forEach((color, index) => {
    traversedLength += segmentLengths[index];
    const progress = traversedLength / totalLength;
    if (progress <= previousProgress || color === routeSegmentColors[index]) return;

    gradient.push(progress, color);
    previousProgress = progress;
  });

  if (previousProgress < 1) gradient.push(1, routeSegmentColors.at(-1) ?? routeSegmentColors[0]);
  return gradient;
}

export function updateMapboxBrandingPosition(map: MapboxMap, safeAreaBottomInset: number) {
  const bottomLeftControls = map.getContainer().querySelector<HTMLElement>('.mapboxgl-ctrl-bottom-left');
  if (bottomLeftControls) {
    const bottomOffset = getActivityRouteReplayMapboxBrandingBottomOffset(safeAreaBottomInset);
    bottomLeftControls.style.bottom = bottomOffset ? `${bottomOffset}px` : '';
    bottomLeftControls.style.alignItems = 'center';
    bottomLeftControls.style.display = 'flex';
    bottomLeftControls.style.flexWrap = 'nowrap';
    bottomLeftControls.style.gap = '4px';

    Array.from(bottomLeftControls.children).forEach((control) => {
      const controlElement = control as HTMLElement;
      controlElement.style.clear = 'none';
      controlElement.style.float = 'none';
      controlElement.style.margin = '0 0 10px 10px';

      if (controlElement.classList.contains('mapboxgl-ctrl-logo')) controlElement.style.order = '0';
      if (controlElement.classList.contains('mapboxgl-ctrl-attrib')) controlElement.style.order = '1';
    });
  }
}

export function styleKilometrePopup(
  popup: MapboxPopup,
  backgroundColor: string,
  textColor: string,
  borderColor: string,
) {
  const element = popup.getElement();
  if (!element) return;
  const content = element.querySelector<HTMLElement>('.mapboxgl-popup-content');
  const tip = element.querySelector<HTMLElement>('.mapboxgl-popup-tip');

  if (content) {
    content.style.backgroundColor = backgroundColor;
    content.style.border = `1px solid ${borderColor}`;
    content.style.borderRadius = '8px';
    content.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    content.style.color = textColor;
    content.style.fontSize = '13px';
    content.style.fontWeight = '600';
    content.style.padding = '5px 9px';
    content.style.whiteSpace = 'nowrap';
  }

  if (!tip) return;
  if (element.classList.contains('mapboxgl-popup-anchor-bottom')) tip.style.borderTopColor = backgroundColor;
  if (element.classList.contains('mapboxgl-popup-anchor-top')) tip.style.borderBottomColor = backgroundColor;
  if (element.classList.contains('mapboxgl-popup-anchor-left')) tip.style.borderRightColor = backgroundColor;
  if (element.classList.contains('mapboxgl-popup-anchor-right')) tip.style.borderLeftColor = backgroundColor;
}

export function updateWebAvatarMarker(
  element: HTMLDivElement | null,
  profile?: Pick<ProfileType, 'name' | 'surname' | 'profilePhoto'>,
) {
  if (!element) return;
  element.replaceChildren();

  if (profile?.profilePhoto) {
    const image = document.createElement('img');
    image.alt = '';
    image.draggable = false;
    image.src = profile.profilePhoto;
    image.style.borderRadius = '50%';
    image.style.height = '36px';
    image.style.objectFit = 'cover';
    image.style.width = '36px';
    element.append(image);
    return;
  }

  const initials = getAvatarLabel(profile?.name, profile?.surname);
  const fallback = document.createElement('span');
  fallback.textContent = initials || '👤';
  fallback.style.fontSize = initials ? '16px' : '22px';
  fallback.style.lineHeight = '36px';
  fallback.style.textAlign = 'center';
  fallback.style.width = '36px';
  element.append(fallback);
}
