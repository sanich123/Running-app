import type { MutableRefObject, RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export function createMockRef<Value extends object>(current: Partial<Value> | null): RefObject<Value | null> {
  return { current: current as unknown as Value | null };
}

export function createMockMutableRef<Value extends object>(
  current: Partial<Value> | null,
): MutableRefObject<Value | null> {
  return { current: current as unknown as Value | null };
}

export function createMockBottomSheetModalRef(
  current: Partial<Pick<BottomSheetModal, 'close' | 'dismiss' | 'present' | 'snapToIndex'>> | null,
): RefObject<BottomSheetModal | null> {
  return createMockRef<BottomSheetModal>(current);
}
