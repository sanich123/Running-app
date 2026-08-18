import { screen } from '@testing-library/react-native';
import { setSavingDisabled } from '@R/slices/activity/activity';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import PreviewImage from './preview-image';

jest.mock('@S/custom-image/custom-image', () => ({
  CustomImage: ({ testID, style, source }: { testID: string; style: any; source: { uri: string } }) => {
    const { Text } = require('react-native');
    return (
      <Text testID={testID} style={style}>
        {source.uri}
      </Text>
    );
  },
}));

describe('preview image', () => {
  beforeEach(() => mockStore.dispatch(setSavingDisabled(false)));

  it('renders the image with compact dimensions', async () => {
    await renderWithProviders(<PreviewImage image="https://example.com/a.jpg" index={2} isDisabled={false} compact />);
    const image = screen.getByTestId('imagePreview-2');
    expect(image).toHaveTextContent('https://example.com/a.jpg');
    expect(image.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ height: 68, borderRadius: 10 })]),
    );
  });

  it('dims the image while it is disabled or being sent', async () => {
    mockStore.dispatch(setSavingDisabled(true));
    await renderWithProviders(<PreviewImage image="https://example.com/a.jpg" index={0} isDisabled={false} />);
    expect(screen.getByTestId('imagePreview-0').props.style).toEqual(expect.arrayContaining([{ opacity: 0.5 }]));
  });
});
