import { fireEvent, screen } from '@testing-library/react-native';
import { LANGUAGES } from '@const/enums';
import { changeLanguage } from '@R/slices/settings/settings';
import { mockStore } from '@T/utils/mock-store';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalConsents from './legal-consents';

describe('LegalConsents', () => {
  it('reports which consent checkbox changed and gives each checkbox an accessible name', async () => {
    mockStore.dispatch(changeLanguage(LANGUAGES.russian));
    const onChange = jest.fn();
    await renderWithProviders(
      <LegalConsents values={{ agreementAndPolicy: false, personalData: false }} onChange={onChange} />,
    );

    expect(screen.getByTestId('legal-consent-agreement').props.accessibilityLabel).toBe(
      'Принимаю пользовательское соглашение и политику обработки персональных данных',
    );
    expect(screen.getByTestId('legal-consent-personal-data').props.accessibilityLabel).toBe(
      'Согласен на обработку персональных данных',
    );

    fireEvent.press(screen.getByTestId('legal-consent-personal-data'));

    expect(onChange).toHaveBeenCalledWith('personalData');
  });
});
