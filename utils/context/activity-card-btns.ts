import type { RefObject } from 'react';
import { createContext } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export const ActivityCardBtnsContext = createContext({
  isLoading: false,
  setIsLoading: (arg: boolean): void => {
    if (arg) return;
  },
  isDisabled: false,
  setIsDisabled: (arg: boolean): void => {
    if (arg) return;
  },
});

export const ModalLikesListContext = createContext({
  modalRef: {} as RefObject<BottomSheetModal>,
});
