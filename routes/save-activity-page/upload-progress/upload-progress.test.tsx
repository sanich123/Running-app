import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import UploadProgress from './upload-progress';

describe('UploadProgress', () => {
  it('exposes the clamped upload progress to assistive technology', async () => {
    await renderWithProviders(<UploadProgress testID="photo-upload-progress" progress={1.4} size={48} />);

    expect(screen.getByTestId('photo-upload-progress').props.accessibilityValue).toEqual({ min: 0, max: 1, now: 1 });
  });
});
