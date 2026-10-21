import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Platform, TextInput as NativeTextInput } from 'react-native';
import { LANGUAGES } from '@const/enums';

export const COMMENT_INPUT = {
  [LANGUAGES.english]: {
    cancel: 'Cancel',
    editingLabel: 'Edit comment',
    label: 'Comment',
    placeholder: 'Add a comment',
    errorSending: 'An error occured while sending a comment',
  },
  [LANGUAGES.russian]: {
    cancel: 'Отмена',
    editingLabel: 'Редактирование комментария',
    label: 'Комментарий',
    placeholder: 'Добавьте комментарий',
    errorSending: 'Во время отправки комментария произошла ошибка',
  },
} as const;

export const COMMENT_ICON_TEST_ID = 'commentInputIcon';
export const COMMENT_INPUT_TEST_ID = 'commentInput';

export const CommentTextInput = Platform.OS === 'web' ? NativeTextInput : BottomSheetTextInput;
