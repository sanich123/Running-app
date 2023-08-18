import React from 'react';
import { Button } from 'react-native-paper';

import { getFromAsyncStorage, setToAsyncStorage } from '../../utils/async-storage-utils';

type AcceptDeclineBtnsProps = {
  title: string;
  description: string;
  sport: string;
  emotion: string;
  isSwitchOn: boolean;
};
export default function AcceptDeclineBtns({ title, description, sport, emotion, isSwitchOn }: AcceptDeclineBtnsProps) {
  return (
    <>
      <Button
        icon="hand-okay"
        mode="contained"
        onPress={async () => setToAsyncStorage('userData', { title, description, sport, emotion, isSwitchOn })}
        style={{ marginTop: 15 }}>
        Save
      </Button>
      <Button
        icon="delete-outline"
        mode="outlined"
        onPress={async () => getFromAsyncStorage('userData')}
        style={{ marginTop: 15 }}>
        Discard
      </Button>
    </>
  );
}
