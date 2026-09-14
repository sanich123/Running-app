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
        priority="high"
        cachePolicy="memory-disk"
        recyclingKey="photo"
        style={{ width: 100, height: 100 }}
      />,
    );
    const image = result.getByTestId('custom-image');
    expect(image.props.source).toEqual({ uri: 'https://example.com/photo.jpg' });
    expect(image.props.contentFit).toBe('cover');
    expect(image.props.placeholder).toBe('blurhash');
    expect(image.props.placeholderContentFit).toBe('cover');
    expect(image.props.priority).toBe('high');
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.recyclingKey).toBe('photo');
    expect(image.props.transition).toEqual({ duration: 650, timing: 'ease-out' });
  });

  it('keeps an explicit placeholder fit and transition', async () => {
    const result = await render(
      <CustomImage
        testID="custom-image-explicit"
        source={{ uri: 'https://example.com/photo.jpg' }}
        contentFit="cover"
        placeholder="blurhash"
        placeholderContentFit="contain"
        transition={0}
        style={{ width: 100, height: 100 }}
      />,
    );
    const image = result.getByTestId('custom-image-explicit');

    expect(image.props.placeholderContentFit).toBe('contain');
    expect(image.props.transition).toBe(0);
  });
});
