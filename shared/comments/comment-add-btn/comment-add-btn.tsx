import { View } from 'react-native';
import { FAB } from 'react-native-paper';
import { setIdOfUpdatingComment, setIsShowingTextInput } from '@R/slices/comment/comment';
import { useAppDispatch } from '@R/typed-hooks';

export default function CommentAddBtn() {
  const dispatch = useAppDispatch();
  return (
    <View style={{ position: 'absolute', right: 20, bottom: 70, zIndex: 100 }}>
      <FAB
        testID="floatingBtn"
        icon="plus"
        onPress={() => {
          dispatch(setIdOfUpdatingComment(''));
          dispatch(setIsShowingTextInput(true));
        }}
      />
    </View>
  );
}
