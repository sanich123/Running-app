import { setIsDisableWhileSending } from '@R/activity/activity';
import { changeLanguage } from '@R/language/language';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import { LANGUAGES } from '@const/enums';
import { screen, userEvent } from '@testing-library/react-native';

import { TEXT_INPUTS } from './const';
import TextInputs from './text-inputs';

describe('Text inputs', () => {
  it('should correctly renders with placeholders in english', () => {
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText(TEXT_INPUTS.english.titlePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(TEXT_INPUTS.english.descriptionPlaceholder);
    expect(titleInput).toBeOnTheScreen();
    expect(descriptionInput).toBeOnTheScreen();
  });
  it('should correctly change text, when interracting with the user', async () => {
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText(TEXT_INPUTS.english.titlePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(TEXT_INPUTS.english.descriptionPlaceholder);

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
  });
  it('should correctly handle isDisabled state', () => {
    renderWithProviders(<TextInputs isDisabled />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText(TEXT_INPUTS.english.titlePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(TEXT_INPUTS.english.descriptionPlaceholder);
    [titleInput, descriptionInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly handle isDisabledWhileSending state', () => {
    mockStore.dispatch(setIsDisableWhileSending(true));
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText(TEXT_INPUTS.english.titlePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(TEXT_INPUTS.english.descriptionPlaceholder);
    [titleInput, descriptionInput].map((input) => expect(input).toBeDisabled());
  });
  it('should correctly render placholders in russian', () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    renderWithProviders(<TextInputs isDisabled={false} />, { store: mockStore });
    const titleInput = screen.getByPlaceholderText(TEXT_INPUTS.russian.titlePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(TEXT_INPUTS.russian.descriptionPlaceholder);
    expect(titleInput).toBeOnTheScreen();
    expect(descriptionInput).toBeOnTheScreen();
  });
});
