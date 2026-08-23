import type { RefObject } from 'react';
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

export type CommentsProps = CommentModalProps;

export interface CommentsLoadMoreButtonProps {
  onPress: () => void;
  isLoading: boolean;
  isError: boolean;
}
