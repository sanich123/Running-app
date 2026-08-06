import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { ProfileType } from '@Routes/card/types';

export interface ComentDeleteBtnProps {
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

export interface CommentsLoadMorBtnProps {
  take: number;
  increaseTakeNumber: (arg: number) => void;
  commentsLength: number;
}
