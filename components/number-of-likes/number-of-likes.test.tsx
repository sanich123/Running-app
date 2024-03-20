import { changeLanguage } from '@R/language/language';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen } from '@testing-library/react-native';

import { NUMBER_OF_LIKES } from './const';
import NumberOfLikes from './number-of-likes';

jest.mock('../../auth/context/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: '926f4a53-08b5-43c6-99ee-cf31fdfbb49b',
      app_metadata: {
        someProp: 'some value',
      },
      user_metadata: {
        someProp: 'some value',
      },
      aud: '',
      created_at: '',
    },
  }),
}));
describe('Number of likes', () => {
  it('should correctly renders, when you liked', () => {
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt like', () => {
    renderWithProviders(
      <NumberOfLikes
        likes={Array(9).fill({
          activityId: '617dddae-05b3-418a-9a8e-5d408a1b897a',
          authorId: 'someWrongUserId',
          date: '2023-10-07T14:38:05.885Z',
          id: '20715e5a-17b1-46ac-9814-5ffb5fde8ac9',
        })}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`9 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you liked in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you did not like in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(
      <NumberOfLikes
        likes={Array(9).fill({
          activityId: '617dddae-05b3-418a-9a8e-5d408a1b897a',
          authorId: 'someWrongUserId',
          date: '2023-10-07T14:38:05.885Z',
          id: '20715e5a-17b1-46ac-9814-5ffb5fde8ac9',
        })}
      />,
      { store: mockStore },
    );
    expect(screen.getByText(new RegExp(`9 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
});
