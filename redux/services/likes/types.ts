export interface SendLike {
  activityId: string;
  authorId: string;
  profilePhoto?: string | null;
}

export interface DeleteLike {
  id: string;
  activityId: string;
}
