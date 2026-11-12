interface ConnectionControlsCopy {
  connect: string;
  iosConnect: string;
  connected: string;
  iosConnected: string;
  autoSync: { title: string };
  iosRequestPermissions: string;
  refresh: string;
}

export interface ConnectionControlsProps {
  autoSyncEnabled: boolean;
  connect: () => Promise<void>;
  copy: ConnectionControlsCopy;
  isAutoSyncing: boolean;
  isConnected: boolean;
  isIOS: boolean;
  isLoading: boolean;
  isReading: boolean;
  setAutoSyncEnabled: (enabled: boolean) => Promise<void>;
  syncLatestWorkouts: (autoImport: boolean) => Promise<void>;
}
