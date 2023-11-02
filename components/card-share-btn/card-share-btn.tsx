import { useContext } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';

export default function ActivityCardShareBtn() {
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton
      testID="iconShareBtn"
      icon="share-outline"
      iconColor={MD3Colors.primary50}
      size={25}
      disabled={isLoading || isDisabled}
    />
  );
}
