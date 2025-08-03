import { ProfileType } from '@C/card/types';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { RefObject } from 'react';

export type ComentDeleteBtnProps = {
  commentId: string;
  activityId: string;
};

export type CommentEditBtnProps = {
  idOfUpdatingComment: string;
  commentId: string;
};

export type CommentInputProps = {
  profile: ProfileType;
  commentToUpdate?: string;
  commentId: string;
  commentsModalRef?: RefObject<BottomSheetModal | null>;
};

export type CommentLikeBtnProps = {
  commentId: string;
  commentLikesFromComment: { authorId: string; id: string }[];
  comment: string;
  profile: ProfileType;
};

export type CommentLikesLengthProps = {
  commentId: string;
  commentLikesFromComment: {
    authorId: string;
    id: string;
  }[];
};

export type CommentModalProps = {
  commentsModalRef: RefObject<BottomSheetModal | null>;
};

export type CommentsLoadMorBtnProps = {
  take: number;
  increaseTakeNumber: (arg: number) => void;
  commentsLength: number;
};
