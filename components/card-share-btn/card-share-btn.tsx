// import * as Sharing from 'expo-sharing';
import { MutableRefObject, ReactNode, useContext } from 'react';
import { IconButton, MD3Colors } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';

import { ActivityCardBtnsContext } from '../../utils/context/activity-card-btns';

export default function ActivityCardShareBtn({ cardRef }: { cardRef: MutableRefObject<ReactNode> }) {
  const { isLoading, isDisabled } = useContext(ActivityCardBtnsContext);

  return (
    <IconButton
      onPress={async () => {
        const snapshot = await captureRef(cardRef, { format: 'jpg' });
        console.log(snapshot);
        // await Sharing.shareAsync(';lk');
      }}
      testID="iconShareBtn"
      icon="share-outline"
      iconColor={MD3Colors.primary50}
      size={25}
      disabled={isLoading || isDisabled}
    />
  );
}
