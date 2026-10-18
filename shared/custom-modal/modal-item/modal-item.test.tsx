import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import ModalItem from './modal-item';

describe('ModalItem', () => {
  it('selects and emits its value', async () => {
    const setSelectedValue = jest.fn();
    const onChange = jest.fn();
    await renderWithProviders(
      <ModalItem
        title="Running"
        value="run"
        setSelectedValue={setSelectedValue}
        onChange={onChange}
        controlRef={{ current: null }}
      />,
    );
    fireEvent.press(screen.getByText('Running'));
    expect(setSelectedValue).toHaveBeenCalledWith('Running', 'run');
    expect(onChange).toHaveBeenCalledWith('run');
  });
});
