import { createRef } from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ActivityLocationInfoModal from './activity-location-info-modal';

jest.mock('@gorhom/bottom-sheet', () => {
  const { ScrollView, View } = require('react-native');
  return {
    BottomSheetBackdrop: View,
    BottomSheetModal: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    BottomSheetModalProvider: ({ children }: any) => <View>{children}</View>,
    BottomSheetScrollView: ScrollView,
  };
});

describe('ActivityLocationInfoModal', () => {
  it('explains how location tracking works', async () => {
    await renderWithProviders(<ActivityLocationInfoModal modalRef={createRef()} />);

    expect(screen.getByTestId('activity-location-info-details')).toBeOnTheScreen();
    expect(screen.getByText('Геопозиция и отслеживание тренировки')).toBeOnTheScreen();
  });
});
