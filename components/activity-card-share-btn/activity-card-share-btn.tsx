import { ActivityCardBtnsContext } from '@u/context/activity-card-btns';
import { useContext } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';

export default function ActivityCardShareBtn() {
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);
  return (
    <IconButton icon="share-outline" iconColor={MD3Colors.primary50} size={25} disabled={isLoading || isDisabled} />
  );
}
