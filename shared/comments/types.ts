import type { ReactNode, RefObject } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ProfileType } from '@S/card/types';

export interface CommentDeleteButtonProps {
  commentId: string;
  activityId: string;
}

export interface CommentEditBtnProps {
  idOfUpdatingComment: string;
  commentId: string;
}

export interface CommentInputProps {
  profile: ProfileType;
  commentToUpdate?: string;
  commentId: string;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
}

export interface CommentLikeBtnProps {
  commentId: string;
  commentLikesFromComment: { authorId: string; id: string }[];
  comment: string;
  profile: ProfileType;
}

export interface CommentLikesLengthProps {
  commentId: string;
  commentLikesFromComment: {
    authorId: string;
    id: string;
  }[];
}

export interface CommentModalProps {
  commentsModalRef: RefObject<BottomSheetModal | null>;
}

export interface CommentsListModalProps extends CommentModalProps {
  commentsLength?: number;
}

export type CommentsViewState = 'loading' | 'empty' | 'loaded' | 'error';

export interface CommentsProps extends CommentModalProps {
  onViewStateChange?: (state: CommentsViewState) => void;
  showEmptyState?: boolean;
  isBottomSheet?: boolean;
  headerComponent?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface CommentsLoadMoreButtonProps {
  onPress: () => void;
  isLoading: boolean;
  isError: boolean;
}
