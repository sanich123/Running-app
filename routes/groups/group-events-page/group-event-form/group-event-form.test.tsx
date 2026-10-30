import { screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventForm from './group-event-form';
import { GROUPS_COPY } from '../../const';

const mockCreateEvent = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('@R/services/groups/groups', () => ({
  useCreateGroupEventMutation: () => [mockCreateEvent, { isLoading: false }],
}));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));

describe('GroupEventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateEvent.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'event-1' }) });
  });

  it('submits a future event and trims optional details', async () => {
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Sunday long run');
    const startsAt = screen.getByTestId('group-event-date-input').props.value;
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() =>
      expect(mockCreateEvent).toHaveBeenCalledWith({
        groupId: 'group-1',
        title: 'Sunday long run',
        description: undefined,
        locationName: undefined,
        startsAt: expect.any(String),
      }),
    );
    expect(new Date(mockCreateEvent.mock.calls[0][0].startsAt).toISOString()).toBe(new Date(startsAt).toISOString());
  });

  it('shows an error when event submission fails', async () => {
    mockCreateEvent.mockReturnValue({ unwrap: jest.fn().mockRejectedValue(new Error('offline')) });
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(<GroupEventForm groupId="group-1" copy={copy} />);
    const user = userEvent.setup();
    await user.type(screen.getByTestId('group-event-title-input'), 'Sunday long run');
    await user.press(screen.getByTestId('group-event-submit'));

    await waitFor(() => expect(mockErrorToast).toHaveBeenCalledWith(copy.eventError, expect.any(Error)));
  });
});
