import { SPORTS_BTNS_VALUES } from '@C/save-activity-page/sports-btns/const';

import { ProfileType } from '../const ';

export type UserInfoProps = {
  profile: ProfileType;
  sport?: SPORTS_BTNS_VALUES;
  date: string;
  userId: string;
  size: UserInfoSize;
};

export enum UserInfoSize {
  small = 'small',
  large = 'large',
}
