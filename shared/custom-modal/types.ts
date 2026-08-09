import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface ModalControls {
  controlRef: RefObject<BottomSheetModal | null>;
  snapPointIndex: number;
  snapPoints: string[];
}

export interface ModalItemProps {
  controlRef: RefObject<BottomSheetModal | null>;
  onChange: (arg: string) => void;
  setSelectedValue: (title: string, value: string) => void;
  value: string;
  title: string;
}
