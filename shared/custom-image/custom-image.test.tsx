import { render } from '@testing-library/react-native';
import CustomImage from './custom-image';

describe('custom image', () => {
  it('passes the source, fit and placeholder to the image implementation', async () => {
    const result = await render(
      <CustomImage
        testID="custom-image"
        source={{ uri: 'https://example.com/photo.jpg' }}
        contentFit="cover"
        placeholder="blurhash"
        style={{ width: 100, height: 100 }}
      />,
    );
    const image = result.getByTestId('custom-image');
    expect(image.props.source).toEqual({ uri: 'https://example.com/photo.jpg' });
    expect(image.props.contentFit).toBe('cover');
    expect(image.props.placeholder).toBe('blurhash');
    expect(image.props.transition).toBe(500);
  });
});
