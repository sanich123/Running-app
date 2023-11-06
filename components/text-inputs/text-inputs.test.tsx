import { screen, userEvent } from '@testing-library/react-native';

import TextInputs from './text-inputs';
import { setIsDisableWhileSending } from '../../redux/activity/activity';
import { mockStore } from '../../tests/utils/mock-store';
import { renderWithProviders } from '../../tests/utils/test-utils';

describe('Text inputs', () => {
  it('should correctly renders with placeholders', () => {
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText('Title your run');
    const descriptionInput = screen.getByPlaceholderText("How'd it go? Share more about your activity");
    expect(titleInput).toBeOnTheScreen();
    expect(descriptionInput).toBeOnTheScreen();
  });
  it('should correctly change text, when interracting with the user', async () => {
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText('Title your run');
    const descriptionInput = screen.getByPlaceholderText("How'd it go? Share more about your activity");

    await userEvent.type(titleInput, 'Some title');
    expect(mockStore.getState().activity.additionalInfo.title).toEqual('Some title');
    expect(titleInput.props.value).toEqual('Some title');

    await userEvent.type(descriptionInput, 'Some description');
    expect(descriptionInput.props.value).toEqual('Some description');
    expect(mockStore.getState().activity.additionalInfo.description).toEqual('Some description');

    await userEvent.clear(titleInput);
    expect(mockStore.getState().activity.additionalInfo.title).toEqual('');
    expect(titleInput.props.value).toEqual('');

    await userEvent.clear(descriptionInput);
    expect(mockStore.getState().activity.additionalInfo.description).toEqual('');
    expect(descriptionInput.props.value).toEqual('');

    // await userEvent.type(titleInput, 'Some title');
    // mockStore.dispatch(setIsNeedToResetInputs(true));

    // const titleInputAwaited = await screen.findByPlaceholderText('Title your run');
    // expect(titleInputAwaited.props.value).toEqual('');
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<TextInputs isDisabled />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText('Title your run');
    const descriptionInput = screen.getByPlaceholderText("How'd it go? Share more about your activity");
    [titleInput, descriptionInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText('Title your run');
    const descriptionInput = screen.getByPlaceholderText("How'd it go? Share more about your activity");
    [titleInput, descriptionInput].map((input) => expect(input).toBeDisabled());
  });
});
