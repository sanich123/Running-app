import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import StyledModal from './styled-modal';

describe('StyledModal', () => {
  it('renders modal content', async () => {
    await renderWithProviders(
      <StyledModal controlRef={{ current: null }} snapPointIndex={0} snapPoints={['50%']}>
        <Text testID="modal-content" />
      </StyledModal>,
    );
    expect(screen.getByTestId('modal-content')).toBeOnTheScreen();
  });
});
