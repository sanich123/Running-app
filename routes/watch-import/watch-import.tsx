import { useCallback, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import CrossPlatformLayout from '@S/cross-platform-layout/cross-platform-layout';
import { errorToast } from '@S/error-toast/error-toast';
import {
  APP_GALLERY_INSTALL_URL,
  APP_GALLERY_URL,
  HEALTH_CONNECT_GUIDE_URL,
  HEALTH_CONNECT_PLAY_STORE_URL,
  HEALTH_SYNC_APP_GALLERY_URL,
  HEALTH_SYNC_CONFIG_SCREENSHOT_URL,
  HEALTH_SYNC_FAQ_URL,
  HEALTH_SYNC_GUIDE_URL,
  HEALTH_SYNC_SOURCE_SCREENSHOT_URL,
  HMS_CORE_GUIDE_URL,
  STRAVA_ANDROID_SUPPORT_URL,
  STRAVA_COUNTRY_SUPPORT_URL,
  STRAVA_DEVICE_COMPATIBILITY_URL,
  STRAVA_SIGN_UP_URL,
  STRAVA_XAPK_URL,
  WATCH_IMPORT_COPY,
  XAPK_INSTALL_GUIDE_URL,
} from './const';
import ExpandableStep from './expandable-step/expandable-step';
import LinkButton from './link-button/link-button';
import { openExternalLink } from './utils';
import { RunichHealth } from '../../modules/runich-health/src/RunichHealth';

export default function WatchImportPage() {
  const { colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const copy = WATCH_IMPORT_COPY[isRussian ? 'ru' : 'en'];
  const { stravaConnection, stravaInstall, healthSyncInstall, healthConnect, finish } = copy.steps;
  const title = copy.title;
  const [isRequestingHealthAccess, setIsRequestingHealthAccess] = useState(false);
  const [healthAccessGranted, setHealthAccessGranted] = useState(false);
  const [healthAccessError, setHealthAccessError] = useState<string | null>(null);

  const requestHealthAccess = useCallback(async () => {
    setIsRequestingHealthAccess(true);
    setHealthAccessError(null);
    try {
      const permissions = await RunichHealth.requestPermissions();
      if (!permissions.granted) {
        setHealthAccessError(healthConnect.actions.accessDenied);
        return;
      }
      setHealthAccessGranted(true);
    } catch (requestError) {
      setHealthAccessError(healthConnect.actions.accessError);
      errorToast('', requestError);
    } finally {
      setIsRequestingHealthAccess(false);
    }
  }, [healthConnect.actions.accessDenied, healthConnect.actions.accessError]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <CrossPlatformLayout scrollViewEnabled outerStyles={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          {title}
        </Text>

        <>
          <Card style={[styles.warningCard, { backgroundColor: colors.errorContainer }]}>
            <Card.Content>
              <Text variant="titleMedium" style={{ color: colors.onErrorContainer }}>
                {copy.warning.title}
              </Text>
              <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onErrorContainer }]}>
                {copy.warning.description}
              </Text>
            </Card.Content>
          </Card>

          <ExpandableStep number={1} title={stravaConnection.title}>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
              {stravaConnection.description}
            </Text>
          </ExpandableStep>

          <ExpandableStep number={2} title={stravaInstall.title}>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
              {stravaInstall.description}
            </Text>
            <LinkButton
              label={stravaInstall.compatibleWatches}
              url={STRAVA_DEVICE_COMPATIBILITY_URL}
              onOpen={openExternalLink}
              standalone
            />
            <View style={styles.buttonStack}>
              {[
                [stravaInstall.actions.createAccount, STRAVA_SIGN_UP_URL],
                [stravaInstall.actions.xapk, STRAVA_XAPK_URL],
                [stravaInstall.actions.installXapk, XAPK_INSTALL_GUIDE_URL],
                [stravaInstall.actions.countryRestrictions, STRAVA_COUNTRY_SUPPORT_URL],
                [stravaInstall.actions.androidRequirements, STRAVA_ANDROID_SUPPORT_URL],
              ].map(([label, url]) => (
                <LinkButton key={label} label={label} url={url} onOpen={openExternalLink} />
              ))}
            </View>
          </ExpandableStep>

          <ExpandableStep number={3} title={healthSyncInstall.title}>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
              {healthSyncInstall.description}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.stabilityWarning, { color: colors.error, fontFamily: FONT_FAMILIES.semiBold }]}>
              {healthSyncInstall.stabilityWarning}
            </Text>
            <Text variant="bodySmall" style={[styles.inlineNote, { color: colors.onSurfaceVariant }]}>
              {healthSyncInstall.note}
            </Text>
            <View style={styles.buttonStack}>
              {[
                [healthSyncInstall.actions.installAppGallery, APP_GALLERY_INSTALL_URL],
                [healthSyncInstall.actions.healthSyncAppGallery, HEALTH_SYNC_APP_GALLERY_URL],
                [healthSyncInstall.actions.findHmsCore, APP_GALLERY_URL],
                [healthSyncInstall.actions.hmsCoreGuide, HMS_CORE_GUIDE_URL],
                [healthSyncInstall.actions.healthSyncHelp, HEALTH_SYNC_FAQ_URL],
              ].map(([label, url]) => (
                <LinkButton key={label} label={label} url={url} onOpen={openExternalLink} />
              ))}
            </View>
            <View style={styles.screenshotsSection}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                {copy.screenshots.title}
              </Text>
              <Text variant="bodySmall" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
                {copy.screenshots.description}
              </Text>
              <Image
                source={{ uri: HEALTH_SYNC_SOURCE_SCREENSHOT_URL }}
                accessibilityLabel={copy.screenshots.sourceLabel}
                resizeMode="contain"
                style={styles.screenshot}
              />
              <Image
                source={{ uri: HEALTH_SYNC_CONFIG_SCREENSHOT_URL }}
                accessibilityLabel={copy.screenshots.configLabel}
                resizeMode="contain"
                style={styles.screenshot}
              />
              <LinkButton
                label={copy.screenshots.documentation}
                url={HEALTH_SYNC_GUIDE_URL}
                onOpen={openExternalLink}
                standalone
              />
            </View>
          </ExpandableStep>

          <ExpandableStep number={4} title={healthConnect.title}>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
              {healthConnect.description}
            </Text>
            <Text variant="bodySmall" style={[styles.inlineNote, { color: colors.onSurfaceVariant }]}>
              {healthConnect.note}
            </Text>
            <View style={styles.buttonStack}>
              <Button
                mode="contained"
                onPress={() => void requestHealthAccess()}
                loading={isRequestingHealthAccess}
                disabled={isRequestingHealthAccess || healthAccessGranted}
                testID="watch-import-health-connect-access">
                {healthAccessGranted ? healthConnect.actions.accessGranted : healthConnect.actions.grantAccess}
              </Button>
              <LinkButton
                label={healthConnect.actions.openPlayStore}
                url={HEALTH_CONNECT_PLAY_STORE_URL}
                onOpen={openExternalLink}
              />
              <LinkButton
                label={healthConnect.actions.setupGuide}
                url={HEALTH_CONNECT_GUIDE_URL}
                onOpen={openExternalLink}
              />
            </View>
            {healthAccessError && <Text style={[styles.errorText, { color: colors.error }]}>{healthAccessError}</Text>}
          </ExpandableStep>

          <ExpandableStep number={5} title={finish.title}>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
              {finish.description}
            </Text>
            <Button
              mode="contained"
              onPress={() => push('/watch-import/guide' as Parameters<typeof push>[0])}
              style={styles.primaryButton}
              contentStyle={styles.primaryButtonContent}
              testID="watch-import-runich-action">
              {finish.action}
            </Button>
          </ExpandableStep>
        </>
      </CrossPlatformLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, gap: 10 },
  title: { marginBottom: 2 },
  warningCard: { marginTop: 2 },
  screenshotsSection: { marginTop: 20 },
  sectionTitle: { marginBottom: 6 },
  bodyText: { lineHeight: 22 },
  stabilityWarning: { lineHeight: 22, marginTop: 12 },
  inlineNote: { lineHeight: 20, marginTop: 12 },
  buttonStack: { gap: 8, marginTop: 14 },
  errorText: { marginTop: 8 },
  primaryButton: { borderRadius: 14, marginTop: 16 },
  primaryButtonContent: { minHeight: 50 },
  screenshot: {
    width: '100%',
    height: 280,
    marginTop: 10,
    backgroundColor: 'rgba(127, 127, 127, 0.08)',
    borderRadius: 8,
  },
});
