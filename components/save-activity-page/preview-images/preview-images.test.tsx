import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { screen, userEvent } from '@testing-library/react-native';

import PreviewImages from './preview-images';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
jest.mock('expo-image', () => {
  const actualExpoImage = jest.requireActual('expo-image');
  const { Image } = jest.requireActual('react-native');

  return { ...actualExpoImage, Image };
});
describe('Preview images', () => {
  it('should correctly renders image', () => {
    const setImages = jest.fn();
    renderWithProviders(
      <PreviewImages images={[{ url: 'someUrl', thumbnail: null }]} setImages={setImages} isDisabled={false} />,
      {
        store: mockStore,
      },
    );
    const image = screen.getByTestId('imagePreview-0');
    expect(image).toBeOnTheScreen();
    expect(image.props.source.uri).toEqual('someUrl');
  });
  it('should correctly delete and image', async () => {
    const setImages = jest.fn();
    renderWithProviders(
      <PreviewImages images={[{ url: 'someUrl', thumbnail: null }]} setImages={setImages} isDisabled={false} />,
      {
        store: mockStore,
      },
    );
    const deleteBtn = screen.getByTestId('deleteIcon');
    expect(deleteBtn).toBeOnTheScreen();
    await userEvent.press(deleteBtn);
    expect(setImages).toHaveBeenCalled();
  });
});
