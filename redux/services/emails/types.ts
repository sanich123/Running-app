export interface EmailDTO {
  name: string;
  surname: string;
  profilePhoto: string;
  recepientName: string;
  recepientSurname: string;
  recepientEmail: string;
}

export interface EmailComment extends EmailDTO {
  comment: string;
  mapPhotoUrl: string;
}

export interface EmailCommentLike extends EmailDTO {
  comment: string;
}

export type EmailLike = EmailDTO & { mapPhotoUrl: string };
