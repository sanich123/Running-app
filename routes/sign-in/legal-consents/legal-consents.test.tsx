import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@T/utils/test-utils';
import LegalConsents from './legal-consents';

describe('LegalConsents', () => {
  it('reports which consent checkbox changed', async () => {
    const onChange = jest.fn();
    await renderWithProviders(
      <LegalConsents values={{ agreementAndPolicy: false, personalData: false }} onChange={onChange} />,
    );

    fireEvent.press(screen.getByTestId('legal-consent-personal-data'));

    expect(onChange).toHaveBeenCalledWith('personalData');
  });
});
