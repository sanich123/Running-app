export interface LegalConsentValues {
  agreementAndPolicy: boolean;
  personalData: boolean;
}

export interface LegalConsentsProps {
  values: LegalConsentValues;
  onChange: (key: keyof LegalConsentValues) => void;
}
