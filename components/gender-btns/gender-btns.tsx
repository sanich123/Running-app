import { useAuth } from '@A/context/auth-context';
import { saveGender } from '@R/profile/profile';
import { useGetUserProfileByIdQuery } from '@R/runich-api/runich-api';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import { useState } from 'react';
import { SegmentedButtons } from 'react-native-paper';

import { GENDER_BTNS, GENDER_BTNS_VALUES } from './const';

export default function GenderBtns({ isDisabled }: { isDisabled: boolean }) {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { data: profileInfo } = useGetUserProfileByIdQuery(`${user?.id}`);

  const { isDisabledWhileSendingProfile } = useAppSelector(({ profile }) => profile);
  const { language } = useAppSelector(({ language }) => language);
  const [gender, setGender] = useState(profileInfo?.gender);

  return (
    <SegmentedButtons
      value={gender}
      onValueChange={(gender: string) => {
        setGender(gender);
        dispatch(saveGender(gender));
      }}
      buttons={[
        {
          value: GENDER_BTNS_VALUES.male,
          label: GENDER_BTNS[language].maleLabel,
          icon: 'human-male',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: GENDER_BTNS_VALUES.female,
          label: GENDER_BTNS[language].femaleLabel,
          icon: 'human-female',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
        {
          value: GENDER_BTNS_VALUES.packman,
          label: GENDER_BTNS[language].packmanLabel,
          icon: 'pac-man',
          showSelectedCheck: true,
          disabled: isDisabled || isDisabledWhileSendingProfile,
        },
      ]}
      style={{ marginTop: 15, paddingLeft: 15, paddingRight: 15 }}
    />
  );
}
