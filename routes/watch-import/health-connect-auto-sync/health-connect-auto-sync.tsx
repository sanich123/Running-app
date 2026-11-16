import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { useWorkoutImport } from '../workout-import/use-workout-import';

export default function HealthConnectAutoSync() {
  const pathname = usePathname();
  const isWorkoutImportPage = pathname === '/watch-import';
  const supportsHealthStoreAutoSync = Platform.OS === 'android' || Platform.OS === 'ios';

  useWorkoutImport({
    autoSync: supportsHealthStoreAutoSync && !isWorkoutImportPage,
    enabled: supportsHealthStoreAutoSync && !isWorkoutImportPage,
  });

  return null;
}
