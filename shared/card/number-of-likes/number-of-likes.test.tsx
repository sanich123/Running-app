import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { MOCK_LIKES } from '@T/mocks/mock-likes';
import { mockStore, setMockUserId } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { NUMBER_OF_LIKES } from './const';
import NumberOfLikes from './number-of-likes';

describe('Number of likes', () => {
  it('should correctly renders, when you liked', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    await renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you didnt like', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    await renderWithProviders(
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
  it('should correctly renders, when you liked in russian', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(<NumberOfLikes likes={MOCK_LIKES} />, { store: mockStore });
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.you))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(NUMBER_OF_LIKES.russian.and))).toBeOnTheScreen();
    expect(screen.getByText(new RegExp(`8 ${NUMBER_OF_LIKES.russian.manyGaveLikes}`))).toBeOnTheScreen();
  });
  it('should correctly renders, when you did not like in russian', async () => {
    mockStore.dispatch(setMockUserId('926f4a53-08b5-43c6-99ee-cf31fdfbb49b'));
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    await renderWithProviders(
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
