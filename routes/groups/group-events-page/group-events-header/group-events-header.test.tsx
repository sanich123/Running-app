import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { renderWithProviders } from '@T/utils/test-utils';
import GroupEventsHeader from './group-events-header';
import { GROUPS_COPY } from '../../const';

describe('GroupEventsHeader', () => {
  it('shows the group event tabs and reports period changes', async () => {
    const onPeriodChange = jest.fn();
    const copy = GROUPS_COPY[LANGUAGES.english];
    await renderWithProviders(
      <GroupEventsHeader groupName="Saturday runners" period="upcoming" onPeriodChange={onPeriodChange} copy={copy} />,
    );

    fireEvent.press(screen.getByText(copy.pastEvents));

    expect(onPeriodChange).toHaveBeenCalledWith('past');
  });
});
