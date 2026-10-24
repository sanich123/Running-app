import { useState } from 'react';
import { FlatList, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import { RESPONSIVE_DIALOG_STYLE } from '@S/responsive-dialog-style';
import { NOTIFICATION_COPY } from '../constants';
import {
  getNotificationAvatarLabel,
  getNotificationDisplayCopy,
  getNotificationIcon,
  getNotificationRelativeTime,
} from '../helpers';
import { notificationsPageStyles as styles } from '../notifications-page.styles';
import { useNotificationsPage } from '../use-notifications-page';
import NotificationActorAvatar from './notification-actor-avatar/notification-actor-avatar';
import type { NotificationItem } from '@R/services/notifications/types';

export default function NotificationsPage() {
  const { colors } = useTheme();
  const { height, width } = useWindowDimensions();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const {
    busyId,
    copy,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
    isMarkingAll,
    locale,
    markNotificationRead,
    markAllNotificationsRead,
    notifications,
    navigateToNotification,
    openNotificationSettings,
    refetch,
    unreadCount,
  } = useNotificationsPage();
  const selectedNotificationCopy = selectedNotification
    ? getNotificationDisplayCopy(selectedNotification, locale)
    : null;
  const selectedNotificationHasTarget =
    selectedNotification?.targetType === 'activity' || selectedNotification?.targetType === 'comment';

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <View
        testID="notificationsContent"
        style={[
          styles.content,
          {
            width: width < MAX_MOBILE_WIDTH ? '100%' : MAX_MOBILE_WIDTH,
            marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
          },
        ]}>
        <View style={styles.actions}>
          <Button
            compact
            icon="check-all"
            testID="markAllNotificationsReadButton"
            disabled={unreadCount === 0 || isMarkingAll}
            loading={isMarkingAll}
            onPress={() => void markAllNotificationsRead()}>
            {copy.markAllRead}
          </Button>
          <Button
            compact
            testID="notificationSettingsButton"
            icon="bell-cog-outline"
            onPress={openNotificationSettings}>
            {copy.settings}
          </Button>
        </View>
        {isError ? (
          <View style={styles.empty}>
            <Text>{copy.loadError}</Text>
            <Button onPress={() => void refetch()}>{copy.retry}</Button>
          </View>
        ) : isLoading ? (
          <View style={styles.empty}>
            <Text>{copy.loading}</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="titleMedium">{copy.empty}</Text>
          </View>
        ) : (
          <FlatList
            testID="notificationsList"
            data={notifications}
            keyExtractor={(item) => item.id}
            onRefresh={() => void refetch()}
            refreshing={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <Text style={styles.footer}>…</Text> : undefined}
            renderItem={({ item }) => {
              const notificationCopy = getNotificationDisplayCopy(item, locale);
              const avatarFallback = NOTIFICATION_COPY[locale].unknownActorInitial;
              return (
                <View
                  style={[styles.row, { backgroundColor: !item.readAt ? colors.surfaceVariant : colors.background }]}>
                  <Pressable
                    accessibilityRole="button"
                    testID={`notification-${item.id}`}
                    disabled={busyId === item.id}
                    onPress={() => {
                      setSelectedNotification(item);
                      void markNotificationRead(item);
                    }}
                    style={({ pressed }) => [styles.rowContent, { opacity: pressed ? 0.72 : 1 }]}>
                    <NotificationActorAvatar
                      photo={item.actorProfilePhoto}
                      label={getNotificationAvatarLabel(item, avatarFallback)}
                      icon={getNotificationIcon(item.type)}
                      testID={`notification-avatar-${item.id}`}
                    />
                    <View style={styles.copy}>
                      <Text variant="titleSmall" style={styles.title}>
                        {notificationCopy.title}
                      </Text>
                      {notificationCopy.body ? (
                        <Text variant="bodyMedium" style={styles.body} numberOfLines={3}>
                          {notificationCopy.body}
                        </Text>
                      ) : null}
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                        {getNotificationRelativeTime(item.createdAt, locale)}
                      </Text>
                    </View>
                  </Pressable>
                  {!item.readAt ? (
                    <>
                      <View
                        testID={`unread-${item.id}`}
                        style={[styles.unreadDot, { backgroundColor: colors.primary }]}
                      />
                      <IconButton
                        testID={`markNotificationRead-${item.id}`}
                        accessibilityLabel={copy.markReadButton}
                        icon="check"
                        iconColor={colors.primary}
                        size={20}
                        disabled={busyId === item.id}
                        loading={busyId === item.id}
                        onPress={() => void markNotificationRead(item)}
                        style={styles.readButton}
                      />
                    </>
                  ) : null}
                </View>
              );
            }}
          />
        )}
      </View>
      <Portal>
        <Dialog
          visible={Boolean(selectedNotification)}
          onDismiss={() => setSelectedNotification(null)}
          style={RESPONSIVE_DIALOG_STYLE}
          testID="notification-details-dialog">
          <Dialog.Title>{selectedNotificationCopy?.title}</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: Math.min(height * 0.6, 500) }}>
              <Text variant="bodyLarge" selectable>
                {selectedNotificationCopy?.body || copy.notificationBodyFallback}
              </Text>
            </ScrollView>
            {selectedNotification ? (
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 12 }}>
                {getNotificationRelativeTime(selectedNotification.createdAt, locale)}
              </Text>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelectedNotification(null)}>{copy.closeNotification}</Button>
            {selectedNotificationHasTarget && selectedNotification ? (
              <Button
                testID="open-notification-target"
                onPress={() => {
                  navigateToNotification(selectedNotification);
                  setSelectedNotification(null);
                }}>
                {copy.openActivity}
              </Button>
            ) : null}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
