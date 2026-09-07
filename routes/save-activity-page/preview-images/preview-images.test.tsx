import { screen, userEvent } from '@testing-library/react-native';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { deletePhotos } from '@U/file-sending';
import PreviewImages from './preview-images';

jest.mock('@U/file-sending', () => ({ deletePhotos: jest.fn().mockResolvedValue(true) }));
const mockDeletePhotos = deletePhotos as jest.MockedFunction<typeof deletePhotos>;

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));
describe('Preview images', () => {
  it('should correctly renders image', async () => {
    const setImages = jest.fn();
    await renderWithProviders(
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
    await renderWithProviders(
      <PreviewImages images={[{ url: 'someUrl', thumbnail: null }]} setImages={setImages} isDisabled={false} />,
      {
        store: mockStore,
      },
    );
    const deleteBtn = screen.getByTestId('deleteIcon');
    expect(deleteBtn).toBeOnTheScreen();
    await userEvent.press(deleteBtn);
    expect(setImages).toHaveBeenCalled();
    expect(mockDeletePhotos).toHaveBeenCalledWith(['someUrl']);
  });
});
