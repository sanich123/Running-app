import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CommentLikeResponse, CommentResponse } from '@R/runich-api/types';
import { RefObject } from 'react';

export type CommentProps = {
  activityId: string;
  idOfUpdatingComment: string;
  setIdOfUpdatingComment: (arg: string) => void;
  setIsShowingTextInput: (arg: boolean) => void;
} & CommentResponse &
  CommentLikeResponse;

export type ComentDeleteBtnProps = {
  commentId: string;
  activityId: string;
};

export type CommentEditBtnProps = {
  idOfUpdatingComment: string;
  setIsShowingTextInput: (arg: boolean) => void;
  setIdOfUpdatingComment: (arg: string) => void;
  commentId: string;
};

export type CommentInputProps = {
  activityId: string;
  setIsShowingTextInput: (arg: boolean) => void;
  commentToUpdate?: string;
  commentId: string;
  setIdOfUpdatingComment: (arg: string) => void;
  idOfUpdatingComment: string;
};

export type CommentLikeBtnProps = {
  commentId: string;
  commentLikesFromComment: { authorId: string; id: string }[];
};

export type CommentLikesLengthProps = {
  commentId: string;
  commentLikesFromComment: {
    authorId: string;
    id: string;
  }[];
};

export type CommentsProps = {
  activityId: string;
  idOfUpdatingComment: string;
  setIdOfUpdatingComment: (arg: string) => void;
  commentsModalRef: RefObject<BottomSheetModal>;
  setIsShowingTextInput: (arg: boolean) => void;
  isShowingTextInput: boolean;
};

export type CommentsListModalProps = {
  commentsModalRef: RefObject<BottomSheetModal>;
  activityId: string;
};

export type CommentsLoadMorBtnProps = {
  take: number;
  increaseTakeNumber: (arg: number) => void;
  commentsLength: number;
};
