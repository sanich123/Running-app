import { screen } from '@testing-library/react-native';
import { NUMBER_OF_LIKES } from '@C/card/number-of-likes/const';
import { LANGUAGES } from '@const/enums';
import { setUserId } from '@R/slices/auth/auth';
import { changeLanguage } from '@R/slices/language/language';
import { MOCK_COMMENT_LIKES } from '@T/mocks/mock-comment-likes';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import CommentLikesLength from './comment-likes-length';

describe('Comment likes length', () => {
  it('should correctly renders in english, when you and others gave likes', async () => {
    mockStore.dispatch(setUserId('7857abb1-b125-4f39-becf-8f30216b46ec'));
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
    mockStore.dispatch(setUserId('7857abb1-b125-4f39-becf-8f30216b46ec'));
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
    mockStore.dispatch(setUserId('someWrongId'));
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
    mockStore.dispatch(setUserId('someWrongId'));
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
