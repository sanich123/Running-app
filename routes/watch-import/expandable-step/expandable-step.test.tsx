import { screen, userEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ExpandableStep from './expandable-step';

describe('ExpandableStep', () => {
  it('starts collapsed and toggles its content on press', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <ExpandableStep number={1} title="Health Connect">
        <Text>Permission instructions</Text>
      </ExpandableStep>,
    );

    const heading = screen.getByLabelText('Health Connect');
    expect(screen.queryByText('Permission instructions')).not.toBeOnTheScreen();
    expect(heading.props.accessibilityState).toEqual({ expanded: false });

    await user.press(heading);
    expect(screen.getByText('Permission instructions')).toBeOnTheScreen();
    expect(heading.props.accessibilityState).toEqual({ expanded: true });

    await user.press(heading);
    expect(screen.queryByText('Permission instructions')).not.toBeOnTheScreen();
  });
});
