import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { createContext, RefObject } from 'react';

export const ActivityCardBtnsContext = createContext({
  isLoading: false,
  setIsLoading: (arg: boolean) => {},
  isDisabled: false,
  setIsDisabled: (arg: boolean) => {},
});

export const ModalLikesListContext = createContext({
  modalRef: {} as RefObject<BottomSheetModal>,
});
