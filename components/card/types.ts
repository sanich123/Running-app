import { LastKmSplit } from '@R/location/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LocationObject } from 'expo-location';
import { MutableRefObject, ReactNode, RefObject } from 'react';

export type CardBtnsProps = {
  activityId: string;
  userId: string;
  cardRef: MutableRefObject<ReactNode>;
  fullViewRef: MutableRefObject<ReactNode | null>;
  isShowDeleteBtn: boolean;
  commentsLength: number;
};

export type CommentBtnProps = {
  activityId: string;
  commentsLength: number;
};

export type ModalLikesListProps = {
  bottomSheetModalRef: RefObject<BottomSheetModal>;
  likesLength: number;
};

export type DisplayActivityMapProps = {
  locations: LocationObject[];
  kilometresSplit: LastKmSplit[];
};
