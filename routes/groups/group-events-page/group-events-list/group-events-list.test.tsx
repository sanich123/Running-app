import { screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventsList from './group-events-list';
import { GROUPS_COPY } from '../../const';

const mockGetEvents = jest.fn();

jest.mock('@R/services/groups/groups', () => ({
  useGetGroupEventsQuery: (...args: unknown[]) => mockGetEvents(...args),
}));

describe('GroupEventsList', () => {
  it('shows event details returned for the selected period', async () => {
    mockGetEvents.mockReturnValue({
      data: [
        {
          id: 'event-1',
          title: 'Sunday long run',
          startsAt: '2026-11-01T10:00:00.000Z',
          description: 'Meet at the park',
          locationName: 'Gorky Park',
        },
      ],
      isLoading: false,
    });
    await renderWithProviders(
      <GroupEventsList
        groupId="group-1"
        period="upcoming"
        canSeeEvents
        copy={GROUPS_COPY[LANGUAGES.english]}
        locale="en-US"
      />,
    );

    expect(screen.getByText('Sunday long run')).toBeOnTheScreen();
    expect(screen.getByText('Meet at the park')).toBeOnTheScreen();
    expect(screen.getByText('Gorky Park')).toBeOnTheScreen();
  });
});
