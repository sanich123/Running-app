import { Platform, StyleSheet } from 'react-native';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import AndroidWatchImportPage from './android-watch-import-page/android-watch-import-page';
import IOSWatchImportPage from './ios-watch-import-page/ios-watch-import-page';

export default function WatchImportPage() {
  return (
    <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
      {Platform.OS === 'ios' ? <IOSWatchImportPage /> : <AndroidWatchImportPage />}
    </CrossPlatformLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
});
