import { Fragment } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { LANGUAGES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import {
  APP_GALLERY_INSTALL_URL,
  APP_GALLERY_URL,
  HEALTH_SYNC_APP_GALLERY_URL,
  HEALTH_SYNC_CONFIG_SCREENSHOT_URL,
  HEALTH_SYNC_FAQ_URL,
  HEALTH_SYNC_GUIDE_URL,
  HEALTH_SYNC_SOURCE_SCREENSHOT_URL,
  HMS_CORE_GUIDE_URL,
  WATCH_IMPORT_COPY,
} from '../../const';
import ExpandableStep from '../../expandable-step/expandable-step';
import { renderHealthConnectLinks } from '../../health-connect-link/utils';
import LinkButton from '../../link-button/link-button';
import { openExternalLink } from '../../utils';
import SupportedWatchApps from '../../workout-import-content/supported-watch-apps/supported-watch-apps';
import WorkoutImportContent from '../../workout-import-content/workout-import-content';
import { useHealthConnectAccess } from './use-health-connect-access';

export default function AndroidWatchImportPage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const isRussian = language === LANGUAGES.russian;
  const {
    title,
    warning,
    importMethods,
    screenshots,
    steps: { healthSyncInstall, healthConnect, finish },
  } = WATCH_IMPORT_COPY[language === LANGUAGES.russian ? 'ru' : 'en'];
  const [healthSyncInstallDescription, ...healthSyncAdditionalInstructions] =
    healthSyncInstall.description.split('\n\n');
  const healthConnectInstructions = healthConnect.description.split('\n\n');
  const { error, isGranted, isRequesting, requestAccess } = useHealthConnectAccess(healthConnect.actions);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <Card style={[styles.warningCard, { backgroundColor: colors.errorContainer }]}>
        <Card.Content>
          <Text variant="titleMedium" style={{ color: colors.onErrorContainer }}>
            {warning.title}
          </Text>
          <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onErrorContainer }]}>
            {warning.description}
          </Text>
        </Card.Content>
      </Card>
      <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
        {importMethods}
      </Text>
      <SupportedWatchApps isRussian={isRussian} platform="android" />

      <ExpandableStep number={1} title={healthSyncInstall.title}>
        <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
          {renderHealthConnectLinks(healthSyncInstallDescription, colors.primary)}
        </Text>
        {healthSyncAdditionalInstructions.map((instruction, index) => {
          const key = `health-sync-instruction-${index}`;
          if (instruction.startsWith('6.')) {
            return (
              <View key={key} style={[styles.successInstruction, { backgroundColor: colors.tertiaryContainer }]}>
                <Text variant="bodyMedium" style={[styles.bodyText, { color: colors.onTertiaryContainer }]}>
                  {renderHealthConnectLinks(instruction, colors.primary)}
                </Text>
              </View>
            );
          }

          return (
            <Text
              key={key}
              variant="bodyMedium"
              style={[
                styles.bodyText,
                styles.instructionParagraph,
                { color: instruction.startsWith('5.') ? colors.error : colors.onSurfaceVariant },
              ]}>
              {renderHealthConnectLinks(instruction, colors.primary)}
            </Text>
          );
        })}
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
            {screenshots.title}
          </Text>
          <Text variant="bodySmall" style={[styles.bodyText, { color: colors.onSurfaceVariant }]}>
            {screenshots.description}
          </Text>
          <Image
            source={{ uri: HEALTH_SYNC_SOURCE_SCREENSHOT_URL }}
            accessibilityLabel={screenshots.sourceLabel}
            resizeMode="contain"
            style={styles.screenshot}
          />
          <Image
            source={{ uri: HEALTH_SYNC_CONFIG_SCREENSHOT_URL }}
            accessibilityLabel={screenshots.configLabel}
            resizeMode="contain"
            style={styles.screenshot}
          />
          <LinkButton
            label={screenshots.documentation}
            url={HEALTH_SYNC_GUIDE_URL}
            onOpen={openExternalLink}
            standalone
          />
        </View>
      </ExpandableStep>

      <ExpandableStep number={2} title={healthConnect.title}>
        {healthConnectInstructions.map((instruction, index) => (
          <Fragment key={`health-connect-instruction-${index}`}>
            <Text
              variant="bodyMedium"
              style={[
                styles.bodyText,
                ...(index > 0 ? [styles.instructionParagraph] : []),
                { color: colors.onSurfaceVariant },
              ]}>
              {renderHealthConnectLinks(instruction, colors.primary)}
            </Text>
            {index === 1 && (
              <>
                <View style={styles.buttonStack}>
                  <Button
                    mode="contained"
                    onPress={() => void requestAccess()}
                    loading={isRequesting}
                    disabled={isRequesting || isGranted}
                    testID="watch-import-health-connect-access">
                    {isGranted ? healthConnect.actions.accessGranted : healthConnect.actions.grantAccess}
                  </Button>
                </View>
                {error && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {renderHealthConnectLinks(error, colors.primary)}
                  </Text>
                )}
              </>
            )}
          </Fragment>
        ))}
      </ExpandableStep>

      <ExpandableStep number={3} title={finish.title} keepMounted>
        <WorkoutImportContent autoSync />
      </ExpandableStep>
    </>
  );
}

const styles = StyleSheet.create({
  warningCard: { marginTop: 2 },
  screenshotsSection: { marginTop: 20 },
  sectionTitle: { marginBottom: 6 },
  bodyText: { lineHeight: 22 },
  instructionParagraph: { marginTop: 8 },
  successInstruction: { marginTop: 8, padding: 10, borderRadius: 8 },
  buttonStack: { gap: 8, marginTop: 14 },
  errorText: { marginTop: 8 },
  screenshot: {
    width: '100%',
    height: 280,
    marginTop: 10,
    backgroundColor: 'rgba(127, 127, 127, 0.08)',
    borderRadius: 8,
  },
});
