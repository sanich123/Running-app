import { fireEvent, screen } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import DatePickerWeb from './date-picker-web';

describe('date picker web', () => {
  it('stores the date chosen by the user', async () => {
    await renderWithProviders(<DatePickerWeb isDisabled={false} />);
    const input = screen.getByTestId('manual-date-picker');
    expect(input.props.style).toEqual(
      expect.objectContaining({ boxSizing: 'border-box', maxWidth: '100%', width: '100%' }),
    );
    fireEvent(input, 'change', { target: { value: '2026-08-06T12:30' } });
    expect(new Date(mockStore.getState().manualActivity.manualDate).toISOString()).toBe('2026-08-06T09:30:00.000Z');
  });
});
