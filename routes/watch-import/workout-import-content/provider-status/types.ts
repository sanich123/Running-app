import type { HealthAvailability } from '../../../../modules/runich-health/src/RunichHealth';

interface ProviderStatusCopy {
  iosUnavailable: string;
  updateProvider: string;
  openGooglePlay: string;
  retry: string;
  providerUnavailable: string;
  openHealthConnect: string;
  minimumAndroid: string;
}

export interface ProviderStatusProps {
  availability: Exclude<HealthAvailability, 'available'>;
  copy: ProviderStatusCopy;
  isIOS: boolean;
  isLoading: boolean;
  needsHealthConnectApp: boolean;
  openHealthConnectInstallPage: () => Promise<void>;
  refreshHealthConnection: () => Promise<void>;
}
