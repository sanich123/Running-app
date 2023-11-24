import { screen } from '@testing-library/react-native';
// import * as router from 'expo-router';

import ActivityCardCommentBtn from '../../components/card-comment-btn/card-comment-btn';
import { renderWithProviders } from '../utils/test-utils';

// jest.mock('expo-router', () => ({
//   useRouter: () => {
//     return {
//       push: jest.fn(),
//     };
//   },
// }));

describe('Activity card comment btn', () => {
  it('should correctly renders', () => {
    renderWithProviders(<ActivityCardCommentBtn activityId="someActivityId" />);
    expect(screen.getByTestId('activityCardCommentBtnIcon')).toBeOnTheScreen();
  });
  //   it('should redirect user to the another page', async () => {
  //     const pushFn = jest.fn();
  //     jest.spyOn(router, 'useRouter').mockImplementation(() => ({
  //       push: pushFn,
  //       back: jest.fn(),
  //       canGoBack: () => true,
  //       replace: jest.fn(),
  //       setParams: jest.fn(),
  //     }));
  //     renderWithProviders(<ActivityCardCommentBtn activityId="someActivityId" />);
  //     const commentBtn = screen.getByTestId('activityCardCommentBtnIcon');
  //     await userEvent.press(commentBtn);
  //     expect(pushFn).toHaveBeenCalled();
  //   });
});
