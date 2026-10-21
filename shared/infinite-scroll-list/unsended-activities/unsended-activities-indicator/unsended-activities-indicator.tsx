import { View, StyleSheet } from 'react-native';
import { Icon, IconButton, Text, useTheme } from 'react-native-paper';
import { useAddActivityByUserIdMutation } from '@R/services/activity/activity';
import { clearUnsyncedActivities, removeFirstUnsyncedActivity } from '@R/slices/activity/activity';
import { clearTrackingRecovery } from '@R/slices/tracking-recovery/tracking-recovery';
import { useAppSelector, useAppDispatch } from '@R/typed-hooks';
import { errorToast, getErrorMessageFromError } from '@S/error-toast/error-toast';
import { successToast } from '@S/success-toast/success-toast';
import { MAX_SAVED_ROUTE_LOCATIONS } from '@U/location/const';
import { readLocationJournal, removeLocationJournal } from '@U/location/location-journal';
import { getReducedLocations } from '@U/location/location-utils';
import { UNSYNCED_ACTIVITIES_TEXT } from '../const';

export default function UnsendedActivitiesIndicator() {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const copy = UNSYNCED_ACTIVITIES_TEXT[language];
  const { unsyncedActivities } = useAppSelector(({ activity }) => activity);
  const trackingRecovery = useAppSelector(({ trackingRecovery }) => trackingRecovery);
  const [sendActivity, { isLoading }] = useAddActivityByUserIdMutation();

  return (
    <View style={[styles.container, { backgroundColor: colors.primaryContainer, borderColor: colors.outlineVariant }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <Icon source="cloud-upload-outline" size={24} color={colors.onPrimary} />
        </View>
        <View style={styles.copy}>
          <Text variant="titleMedium" style={{ color: colors.onPrimaryContainer }}>
            {copy.title(unsyncedActivities.length)}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {isLoading ? copy.sending : copy.pending}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <IconButton
          icon="sync"
          testID="send-unsynced-activities"
          mode="contained-tonal"
          iconColor={colors.primary}
          containerColor={colors.surface}
          loading={isLoading}
          onPress={async () => {
            const pendingActivity = unsyncedActivities?.[0];
            if (pendingActivity) {
              const journalId = pendingActivity.routeJournalId ?? null;
              const routeLocations = journalId ? (readLocationJournal(journalId)?.locations ?? []) : [];
              if (journalId && !routeLocations.length) {
                errorToast('', copy.restoreRouteError);
                return;
              }

              await sendActivity({
                id: pendingActivity.id,
                body: {
                  ...pendingActivity.body,
                  locations: getReducedLocations(routeLocations, MAX_SAVED_ROUTE_LOCATIONS),
                },
              })
                .unwrap()
                .then(() => {
                  if (journalId) removeLocationJournal(journalId);
                  if (journalId && trackingRecovery.journalId === journalId) dispatch(clearTrackingRecovery());
                  dispatch(removeFirstUnsyncedActivity());
                  successToast(copy.success);
                })
                .catch((error) => errorToast('', getErrorMessageFromError(error)));
            }
          }}
          disabled={isLoading}
          accessibilityLabel={copy.send}
        />

        <IconButton
          icon="delete-outline"
          testID="delete-unsynced-activities"
          mode="contained-tonal"
          iconColor={colors.error}
          containerColor={colors.errorContainer}
          loading={isLoading}
          disabled={isLoading}
          onPress={() => {
            const shouldClearRecovery = unsyncedActivities.some(
              ({ routeJournalId }) => routeJournalId && routeJournalId === trackingRecovery.journalId,
            );
            unsyncedActivities.forEach(({ routeJournalId }) => {
              if (routeJournalId) removeLocationJournal(routeJournalId);
            });
            if (shouldClearRecovery) dispatch(clearTrackingRecovery());
            dispatch(clearUnsyncedActivities());
          }}
          accessibilityLabel={copy.remove}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 12,
    padding: 14,
  },
  content: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 },
  iconContainer: { alignItems: 'center', borderRadius: 14, height: 44, justifyContent: 'center', width: 44 },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: 2 },
});
