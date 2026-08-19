import { act } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import DatePickerWeb from './date-picker-web';

const mockSetParams = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ manualDate: '2026-08-06T10:00:00.000Z' }),
  useRouter: () => ({ setParams: mockSetParams }),
}));

describe('date picker web', () => {
  it('stores the date chosen by the user', async () => {
    const { container } = await renderWithProviders(<DatePickerWeb isDisabled={false} />);
    const input = container.queryAll(({ type }) => type === 'input')[0];
    expect(input.props.style).toEqual(
      expect.objectContaining({ boxSizing: 'border-box', maxWidth: '100%', width: '100%' }),
    );
    await act(async () => {
      input.props.onChange({ target: { value: '2026-08-06T12:30' } });
    });
    expect(mockSetParams).toHaveBeenCalledWith({ manualDate: '2026-08-06T09:30:00.000Z' });
  });
});
