import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

export type UserInfoProps = {
  profile: { surname: string; name: string; profilePhoto: string; profilePhotoBlurhash: string };
  sport?: SPORTS_BTNS_VALUES;
  date: string;
  userId: string;
  size: UserInfoSize;
};

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
