import { screen, userEvent } from '@testing-library/react-native';

import PreviewImages from './preview-images';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

jest.mock('react-native-compressor', () => ({
  Image: () => ({
    compress: jest.fn(),
  }),
}));

describe('Preview images', () => {
  it('should correctly renders image', () => {
    const setImages = jest.fn();
    renderWithProviders(<PreviewImages images={['someUrl']} setImages={setImages} isDisabled={false} />, {
      store: mockStore,
    });
    const image = screen.getByTestId('imagePreview-0');
    expect(image).toBeOnTheScreen();
    expect(image.props.source[0].uri).toEqual('someUrl');
  });
  it('should correctly delete and image', async () => {
    const setImages = jest.fn();
    renderWithProviders(<PreviewImages images={['someUrl']} setImages={setImages} isDisabled={false} />, {
      store: mockStore,
    });
    const deleteBtn = screen.getByTestId('deleteIcon');
    expect(deleteBtn).toBeOnTheScreen();
    await userEvent.press(deleteBtn);
    expect(setImages).toHaveBeenCalled();
  });
});
