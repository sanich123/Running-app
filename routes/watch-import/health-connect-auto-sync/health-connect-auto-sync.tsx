import { Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { useWorkoutImport } from '../workout-import/use-workout-import';

export default function HealthConnectAutoSync() {
  const pathname = usePathname();
  const isWorkoutImportPage = pathname === '/watch-import';
  const isAndroid = Platform.OS === 'android';

  useWorkoutImport({
    autoSync: isAndroid && !isWorkoutImportPage,
    enabled: isAndroid && !isWorkoutImportPage,
  });

  return null;
}
