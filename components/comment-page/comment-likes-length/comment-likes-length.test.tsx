import { MOCK_COMMENT_LIKES } from '@T/mocks/mock-comment-likes';
import { screen } from '@testing-library/react-native';

import CommentLikesLength from './comment-likes-length';
import * as auth from '../../../auth/context/auth-context';
import { LANGUAGES } from '../../../constants/enums';
import { changeLanguage } from '../../../redux/language/language';
import { USER_AUTH_MOCKS } from '../../../tests/mocks/use-auth';
import { mockStore } from '../../../tests/utils/mock-store';
import { renderWithProviders } from '../../../tests/utils/test-utils';
import { NUMBER_OF_LIKES } from '../../card/number-of-likes/const';

describe('Comment likes length', () => {
  it('should correctly renders in english, when you and others gave likes', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '7857abb1-b125-4f39-becf-8f30216b46ec',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(
      <CommentLikesLength
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_COMMENT_LIKES}
      />,
      { store: mockStore },
    );
    expect(
      await screen.findByText(new RegExp(`${NUMBER_OF_LIKES.english.and}3 ${NUMBER_OF_LIKES.english.manyGaveLikes}`)),
    ).toBeOnTheScreen();
  });
  it('should correctly renders in russian, when you and others gave likes', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '7857abb1-b125-4f39-becf-8f30216b46ec',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(
      <CommentLikesLength
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_COMMENT_LIKES}
      />,
      { store: mockStore },
    );
    expect(
      await screen.findByText(new RegExp(`${NUMBER_OF_LIKES.russian.and}3 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`)),
    ).toBeOnTheScreen();
  });
  it('should correctly renders in english, when you didnt like', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(
      <CommentLikesLength
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_COMMENT_LIKES}
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`4 ${NUMBER_OF_LIKES.english.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders in russian, when you didnt like', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(
      <CommentLikesLength
        commentId="922dca27-f99c-4165-96d6-5a04bbb6e9cb"
        commentLikesFromComment={MOCK_COMMENT_LIKES}
      />,
      { store: mockStore },
    );
    expect(await screen.findByText(new RegExp(`4 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
});
