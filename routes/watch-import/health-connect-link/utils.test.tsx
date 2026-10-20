import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native-paper';
import { HEALTH_CONNECT_PLAY_STORE_URL } from '../const';
import { openExternalLink } from '../utils';
import { HEALTH_CONNECT_LINK_PHRASES } from './const';
import { renderHealthConnectLinks } from './utils';

jest.mock('../utils', () => ({ openExternalLink: jest.fn() }));

describe('renderHealthConnectLinks', () => {
  it('turns Health Connect mentions into links and leaves surrounding text readable', async () => {
    const phrase = HEALTH_CONNECT_LINK_PHRASES[0];
    const { getByRole, getByText } = await render(
      <Text>{renderHealthConnectLinks(`Установите приложение. ${phrase} и выдайте разрешение.`, '#f60')}</Text>,
    );

    expect(getByText(`Установите приложение. ${phrase} и выдайте разрешение.`)).toBeOnTheScreen();
    expect(getByRole('link', { name: phrase })).toHaveStyle({ color: '#f60', textDecorationLine: 'underline' });
  });

  it('opens the Health Connect Play Store page when the link is pressed', async () => {
    const phrase = HEALTH_CONNECT_LINK_PHRASES[1];
    const { getByRole } = await render(<Text>{renderHealthConnectLinks(phrase, '#f60')}</Text>);
    fireEvent.press(getByRole('link', { name: phrase }));

    expect(openExternalLink).toHaveBeenCalledWith(HEALTH_CONNECT_PLAY_STORE_URL);
  });

  it('does not turn plain text into a link', async () => {
    const text = 'Open the settings screen';
    const { getByText, queryByRole } = await render(<Text>{renderHealthConnectLinks(text, '#f60')}</Text>);

    expect(getByText(text)).toBeOnTheScreen();
    expect(queryByRole('link')).toBeNull();
  });
});
