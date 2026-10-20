import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
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
    expect(image.props.placeholder).toBe('blurhash:/blurhash');
    expect(image.props.placeholderContentFit).toBe('cover');
    expect(image.props.priority).toBe('high');
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.recyclingKey).toBe('photo');
    expect(image.props.transition).toEqual({ duration: 180, timing: 'ease-out' });
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

  it('skips the transition when the image is already in the disk cache', async () => {
    const getCachePathAsync = jest.spyOn(Image, 'getCachePathAsync').mockResolvedValue('/cache/photo.jpg');

    try {
      const result = await render(
        <CustomImage
          testID="custom-image-cached"
          source={{ uri: 'https://example.com/cached-photo.jpg' }}
          placeholder="blurhash"
          cachePolicy="memory-disk"
          style={{ width: 100, height: 100 }}
        />,
      );

      const image = result.getByTestId('custom-image-cached');
      expect(image.props.transition).toBe(0);
    } finally {
      getCachePathAsync.mockRestore();
    }
  });

  it('keeps the image source available while the cache is being checked so the blurhash can render', async () => {
    const getCachePathAsync = jest.spyOn(Image, 'getCachePathAsync').mockResolvedValue(null);

    try {
      const result = await render(
        <CustomImage
          testID="custom-image-loading"
          source={{ uri: 'https://example.com/slow-photo.jpg' }}
          placeholder="blurhash"
          cachePolicy="memory-disk"
          style={{ width: 100, height: 100 }}
        />,
      );

      const image = result.getByTestId('custom-image-loading');
      expect(image.props.source).toEqual({ uri: 'https://example.com/slow-photo.jpg' });
      expect(image.props.placeholder).toBe('blurhash:/blurhash');
    } finally {
      getCachePathAsync.mockRestore();
    }
  });

  it('handles empty sources and web-specific image props', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      const result = await render(
        <CustomImage
          testID="custom-image-web"
          source={{ uri: null }}
          cachePolicy="none"
          recyclingKey="photo"
          style={{ width: 100, height: 100 }}
        />,
      );

      const image = result.toJSON() as { props: Record<string, unknown> };
      expect(image.props.source).toEqual({ uri: '' });
      expect(image.props.testID).toBeUndefined();
      expect(image.props.recyclingKey).toBeUndefined();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });

  it('handles a cache probe failure and an unmounted cache probe', async () => {
    const getCachePathAsync = jest.spyOn(Image, 'getCachePathAsync').mockRejectedValue(new Error('cache unavailable'));

    try {
      await render(
        <CustomImage
          testID="custom-image-error"
          source={{ uri: 'https://example.com/cache-error.jpg' }}
          cachePolicy="memory-disk"
          style={{ width: 100, height: 100 }}
        />,
      );
      await waitFor(() => expect(getCachePathAsync).toHaveBeenCalled());

      let resolveCache!: (value: string | null) => void;
      getCachePathAsync.mockImplementation(() => new Promise<string | null>((resolve) => (resolveCache = resolve)));
      const result = await render(
        <CustomImage
          testID="custom-image-unmounted"
          source={{ uri: 'https://example.com/cache-unmounted.jpg' }}
          cachePolicy="memory-disk"
          style={{ width: 100, height: 100 }}
        />,
      );
      result.unmount();
      resolveCache(null);
      await Promise.resolve();
    } finally {
      getCachePathAsync.mockRestore();
    }
  });

  it('forwards image load events and handles a disabled cache policy', async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    const onLoad = jest.fn();
    try {
      const result = await render(
        <CustomImage
          testID="custom-image-load"
          source={{ uri: 'https://example.com/load.jpg' }}
          cachePolicy="none"
          onLoad={onLoad}
          style={{ width: 100, height: 100 }}
        />,
      );

      fireEvent(result.getByTestId('custom-image-load'), 'load', { source: { width: 100, height: 100 } });
      expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ source: { width: 100, height: 100 } }));
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS });
    }
  });
});
