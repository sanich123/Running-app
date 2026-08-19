import { createElement } from 'react';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export function backdrop(props: any) {
  return createElement(BottomSheetBackdrop, { appearsOnIndex: 0, disappearsOnIndex: -1, ...props });
}
