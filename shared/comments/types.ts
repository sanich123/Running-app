import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface CommentDeleteButtonProps {
  commentId: string;
  activityId: string;
}

export interface CommentEditBtnProps {
  idOfUpdatingComment: string;
  commentId: string;
  comment: string;
}

export interface CommentInputProps {
  commentToUpdate?: string;
  commentId: string;
}

export interface CommentLikeBtnProps {
  activityId?: string;
  commentId: string;
  commentLikesFromComment: { authorId: string; id: string }[];
  disabled?: boolean;
  showLikeButton?: boolean;
  showCount?: boolean;
}

export interface CommentLikesLengthProps {
  commentId: string;
  commentLikesFromComment: {
    authorId: string;
    id: string;
  }[];
  providedLikes?: { authorId: string; id: string }[];
  error?: unknown;
  isError?: boolean;
}

interface CommentModalProps {
  commentsModalRef: RefObject<BottomSheetModal | null>;
}

export interface CommentsListModalProps extends CommentModalProps {
  allowNewComments?: boolean;
}

export type CommentsProps = CommentModalProps;

export interface CommentsLoadMoreButtonProps {
  onPress: () => void;
  isLoading: boolean;
  isError: boolean;
}
