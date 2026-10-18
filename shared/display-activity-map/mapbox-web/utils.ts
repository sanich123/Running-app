import { getActivityRouteReplayMapboxBrandingBottomOffset } from '@S/activity-route-replay/const';
import { getAvatarLabel } from '../../avatar/user-avatar/utils';
import type { ProfileType } from '@S/card/types';
import type { Map as MapboxMap, Popup as MapboxPopup } from 'mapbox-gl';

export function updateMapboxBrandingPosition(map: MapboxMap, safeAreaBottomInset: number) {
  const bottomLeftControls = map.getContainer().querySelector<HTMLElement>('.mapboxgl-ctrl-bottom-left');
  if (bottomLeftControls) {
    const bottomOffset = getActivityRouteReplayMapboxBrandingBottomOffset(safeAreaBottomInset);
    bottomLeftControls.style.bottom = bottomOffset ? `${bottomOffset}px` : '';
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
