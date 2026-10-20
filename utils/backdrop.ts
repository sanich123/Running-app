import { createElement } from 'react';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export function backdrop(props: BottomSheetBackdropProps) {
  return createElement(BottomSheetBackdrop, { appearsOnIndex: 0, disappearsOnIndex: -1, ...props });
}
