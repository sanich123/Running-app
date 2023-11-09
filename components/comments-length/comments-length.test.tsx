import { screen } from '@testing-library/react-native';

import CommentsLength from './comments-length';
import { COMMENTS_ENDING, COMMENTS_LENGTH_TEST_ID, getWordEnding } from './const';
import { LANGUAGES } from '../../constants/enums';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';
jest.mock('expo-router', () => ({
  useRouter: () => {
    return {
      push: jest.fn(),
    };
  },
}));
describe('Comments length', () => {
  it('should correctly renders received comments length', async () => {
    renderWithProviders(<CommentsLength activityId="189d2c10-463c-42f5-9f09-5e9fa6aa2720" />, { store: mockStore });
    expect(await screen.findByTestId(COMMENTS_LENGTH_TEST_ID)).toBeOnTheScreen();
    expect(await screen.findByText('8 comments')).toBeOnTheScreen();
  });
  it('should correctly get end of the comments length', () => {
    expect(getWordEnding(1, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.oneComment);
    expect(getWordEnding(1, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.oneComment);
    expect(getWordEnding(2, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(2, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.twoFourComments);
    expect(getWordEnding(3, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(3, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.twoFourComments);
    expect(getWordEnding(4, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(4, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.twoFourComments);
    expect(getWordEnding(5, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(5, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.fiveZeroComments);
    expect(getWordEnding(9, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(9, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.fiveZeroComments);
    expect(getWordEnding(199, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(199, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.fiveZeroComments);
    expect(getWordEnding(191, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.oneComment);
    expect(getWordEnding(191, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.oneComment);
    expect(getWordEnding(192, LANGUAGES.english)).toEqual(COMMENTS_ENDING.english.manyComments);
    expect(getWordEnding(192, LANGUAGES.russian)).toEqual(COMMENTS_ENDING.russian.twoFourComments);
  });
});
