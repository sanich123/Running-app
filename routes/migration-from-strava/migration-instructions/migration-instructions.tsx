import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { View, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Card, Text, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { STRAVA_EXPORT_URL } from '../const';
import { removeStepNumber } from '../utils';
import type { MigrationCopy } from '../const';

export default function MigrationInstructions({ copy }: { copy: MigrationCopy }) {
  const { colors } = useTheme();
  const steps = [copy.archiveToEmail, copy.whereToUpload];

  return (
    <>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
          <MaterialCommunityIcons name="database-import-outline" size={28} color={colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          {copy.title}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {copy.ableToTransfer}
        </Text>
      </View>

      <Card style={[styles.card, { backgroundColor: colors.surface }]} mode="contained">
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {copy.howItWorks}
          </Text>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
              <Text variant="labelLarge" style={{ color: colors.primary }}>
                1
              </Text>
            </View>
            <Link
              href={STRAVA_EXPORT_URL}
              testID="migration-export-instructions"
              style={[styles.stepText, { color: colors.primary }]}>
              {removeStepNumber(copy.moreInfo)}
            </Link>
          </View>
          {steps.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primaryContainer }]}>
                <Text variant="labelLarge" style={{ color: colors.primary }}>
                  {index + 2}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.stepText}>
                {removeStepNumber(step)}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={[styles.notice, { backgroundColor: colors.tertiaryContainer }]}>
        <MaterialCommunityIcons name="information-outline" size={22} color={colors.tertiary} />
        <Text variant="bodyMedium" style={{ color: colors.onTertiaryContainer, flex: 1 }}>
          {copy.removeMedia} {copy.processUnZipping} {copy.wifiConnection} {copy.serverResponseTime}{' '}
          {copy.backgroundUploadLimitations}
        </Text>
      </View>

      <View style={[styles.notice, { backgroundColor: colors.secondaryContainer }]}>
        <MaterialCommunityIcons name="file-alert-outline" size={22} color={colors.secondary} />
        <Text variant="bodyMedium" style={{ color: colors.onSecondaryContainer, flex: 1 }}>
          {copy.archiveLimit}
          <Link href={`/${ROUTES.feedback}`} testID="migration-feedback-link" style={{ color: colors.primary }}>
            {copy.feedbackLink}
          </Link>
          .
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 12,
    width: 64,
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 18,
  },
  sectionTitle: {
    marginBottom: 14,
  },
  step: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stepNumber: {
    alignItems: 'center',
    borderRadius: 10,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  notice: {
    alignItems: 'flex-start',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
});
