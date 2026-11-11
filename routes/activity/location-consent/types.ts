export interface LocationConsentProps {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
  disabled?: boolean;
  onDetailsPress?: () => void;
}
