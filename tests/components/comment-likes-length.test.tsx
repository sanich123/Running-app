import { screen } from '@testing-library/react-native';

import * as auth from '../../auth/context/auth-context';
import CommentLikesLength from '../../components/comment-likes-length/comment-likes-length';
import { NUMBER_OF_LIKES } from '../../components/number-of-likes/const';
import { LANGUAGES } from '../../constants/enums';
import { changeLanguage } from '../../redux/language/language';
import { USER_AUTH_MOCKS } from '../mocks/use-auth';
import { mockStore } from '../utils/mock-store';
import { renderWithProviders } from '../utils/test-utils';
describe('Comment likes length', () => {
  it('should correctly renders in english, when you and others gave likes', async () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '7857abb1-b125-4f39-becf-8f30216b46ec',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
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
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
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
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
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
    renderWithProviders(<CommentLikesLength id="922dca27-f99c-4165-96d6-5a04bbb6e9cb" />, { store: mockStore });
    expect(await screen.findByText(new RegExp(`4 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
});
