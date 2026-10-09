import { usePathname } from 'expo-router';
import { useWorkoutImport } from '../workout-import/use-workout-import';

export default function HealthConnectAutoSync() {
  const pathname = usePathname();
  const isWorkoutImportPage = pathname === '/watch-import/guide';

  useWorkoutImport({
    autoSync: !isWorkoutImportPage,
    enabled: !isWorkoutImportPage,
  });

  return null;
}
