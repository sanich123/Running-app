import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface Modal {
  controlRef: RefObject<BottomSheetModal | null>;
  onChange: (arg: string) => void;
  setSelectedValue: (title: string, value: string) => void;
}
export interface ModalControls {
  controlRef: RefObject<BottomSheetModal | null>;
  snapPointIndex: number;
  snapPoints: string[];
}

export interface CategoryModalProps extends Modal {
  valuesToRender: { value: string; title: string }[];
  snapPointIndex: number;
  snapPoints?: string[];
}

export interface RenderItemProps {
  item: { value: string; title: string };
}

export interface ModalItemProps {
  controlRef: RefObject<BottomSheetModal | null>;
  onChange: (arg: string) => void;
  setSelectedValue: (title: string, value: string) => void;
  value: string;
  title: string;
}
