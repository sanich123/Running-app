import { FAB } from 'react-native-paper';

export default function FloatingBtn({ onPressFn }: { onPressFn: (arg: any) => void }) {
  return (
    <FAB
      icon="plus"
      style={{
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
      }}
      onPress={onPressFn}
    />
  );
}
