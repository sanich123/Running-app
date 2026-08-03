import type { RefObject } from 'react';
import { createContext } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export const ActivityCardBtnsContext = createContext({
  isLoading: false,
  setIsLoading: (arg: boolean) => {},
  isDisabled: false,
  setIsDisabled: (arg: boolean) => {},
});

export const ModalLikesListContext = createContext({
  modalRef: {} as RefObject<BottomSheetModal>,
});
