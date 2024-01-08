import * as auth from '@A/context/auth-context';
import { changeLanguage } from '@R/language/language';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { USER_AUTH_MOCKS } from '@T/mocks/use-auth';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { errorExtracter } from '@U/error-handler';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { NUMBER_OF_LIKES } from './const';
import NumberOfLikes from './number-of-likes';

describe('Number of likes', () => {
  it('should correctly renders, when you liked', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={undefined} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.english.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.english.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.english.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt like', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={undefined} />, { store: mockStore });
    expect(screen.getByText(new RegExp(`9 ${NUMBER_OF_LIKES.english.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you liked in russian', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={undefined} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you did not like in russian', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={undefined} />, { store: mockStore });
    expect(screen.getByText(new RegExp(`9 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly handle an error in russian, when an error occured', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={{ status: 400, data: undefined }} />, {
      store: mockStore,
    });
    expect(
      screen.getByText(
        new RegExp(`${NUMBER_OF_LIKES.russian.error}: ${errorExtracter({ status: 400, data: undefined })}`),
      ),
    ).toBeOnTheScreen();
  });
  it('should correctly handle an error in english, when an error occured', () => {
    jest.spyOn(auth, 'useAuth').mockImplementation(() => ({
      user: {
        id: 'someWrongId',
        ...USER_AUTH_MOCKS,
      },
    }));
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} error={{ status: 400, data: undefined }} />, {
      store: mockStore,
    });
    expect(
      screen.getByText(
        new RegExp(`${NUMBER_OF_LIKES.english.error}: ${errorExtracter({ status: 400, data: undefined })}`),
      ),
    ).toBeOnTheScreen();
  });
});
