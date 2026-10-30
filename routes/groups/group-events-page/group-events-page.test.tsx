import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventsPage from './group-events-page';

const mockGetGroup = jest.fn();
const mockGetEvents = jest.fn();
const mockCreateMutation = jest.fn();
const mockCreateEvent = jest.fn();
const mockErrorToast = jest.fn();

jest.mock('expo-router', () => ({ useLocalSearchParams: () => ({ groupId: 'group-1' }) }));
jest.mock('@S/error-toast/error-toast', () => ({ errorToast: (...args: unknown[]) => mockErrorToast(...args) }));
jest.mock('@R/services/groups/groups', () => ({
  useGetGroupByIdQuery: (...args: unknown[]) => mockGetGroup(...args),
  useGetGroupEventsQuery: (...args: unknown[]) => mockGetEvents(...args),
  useCreateGroupEventMutation: () => mockCreateMutation(),
}));

describe('GroupEventsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore.dispatch(changeLanguage(LANGUAGES.english));
    mockGetGroup.mockReturnValue({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        privacy: 'open',
        canManage: true,
        currentMembership: { status: 'active', role: 'owner' },
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetEvents.mockReturnValue({ data: [], isLoading: false });
    mockCreateEvent.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ id: 'event-1' }) });
    mockCreateMutation.mockReturnValue([mockCreateEvent, { isLoading: false }]);
  });

  it('shows upcoming and past event sections', async () => {
    await renderWithProviders(<GroupEventsPage />);
    expect(screen.getByText('No upcoming events')).toBeOnTheScreen();

    await userEvent.press(screen.getByText('Past'));

    expect(screen.getByText('No past events')).toBeOnTheScreen();
    expect(mockGetEvents).toHaveBeenLastCalledWith({ groupId: 'group-1', period: 'past' }, { skip: false });
  });

  it('lets group admins create a future event', async () => {
    await renderWithProviders(<GroupEventsPage />);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.type(screen.getByTestId('group-event-title-input'), 'Sunday long run');
    const startsAt = new Date(screen.getByTestId('group-event-date-input').props.value as string).toISOString();
    const submit = screen.getByTestId('group-event-submit');
    expect(submit.props.accessibilityState.disabled).toBe(false);

    await user.press(submit);

    await waitFor(() =>
      expect(mockCreateEvent).toHaveBeenCalledWith({
        groupId: 'group-1',
        title: 'Sunday long run',
        description: undefined,
        locationName: undefined,
        startsAt,
      }),
    );
  });

  it('shows events without creation controls to members', async () => {
    mockGetGroup.mockReturnValueOnce({
      data: {
        id: 'group-1',
        name: 'Saturday runners',
        privacy: 'open',
        canManage: false,
        currentMembership: { status: 'active', role: 'member' },
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockGetEvents.mockReturnValueOnce({
      data: [
        {
          id: 'event-1',
          title: 'Community run',
          description: 'Easy pace',
          locationName: 'Central park',
          startsAt: '2026-10-31T10:00:00.000Z',
          createdAt: '2026-10-29T10:00:00.000Z',
        },
      ],
      isLoading: false,
    });
    await renderWithProviders(<GroupEventsPage />);

    expect(screen.getByText('Community run')).toBeOnTheScreen();
    expect(screen.getByText('Central park')).toBeOnTheScreen();
    expect(screen.queryByText('Create event')).not.toBeOnTheScreen();
  });

  it('shows the Russian empty state and retries a group load error', async () => {
    const refetch = jest.fn();
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    mockGetGroup.mockReturnValueOnce({ data: undefined, isLoading: false, isError: true, refetch });
    await renderWithProviders(<GroupEventsPage />);

    expect(screen.getByText('Не удалось загрузить группы')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Повторить'));
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
