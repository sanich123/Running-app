import { useState } from 'react';
import { FlatList, Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { Avatar, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { MAX_MOBILE_WIDTH } from '@const/const';
import CustomImage from '@S/custom-image/custom-image';
import { NOTIFICATION_COPY } from './constants';
import { getNotificationAvatarLabel, getNotificationDisplayCopy, getNotificationRelativeTime } from './helpers';
import { notificationsPageStyles as styles } from './notifications-page.styles';
import { useNotificationsPage } from './use-notifications-page';

export default function NotificationsPage() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
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
    openNotification,
    openNotificationSettings,
    refetch,
    unreadCount,
  } = useNotificationsPage();

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
                    onPress={() => void openNotification(item)}
                    style={({ pressed }) => [styles.rowContent, { opacity: pressed ? 0.72 : 1 }]}>
                    <NotificationActorAvatar
                      photo={item.actorProfilePhoto}
                      label={getNotificationAvatarLabel(item, avatarFallback)}
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
    </View>
  );
}

function NotificationActorAvatar({ photo, label, testID }: { photo: string | null; label: string; testID: string }) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  if (!photo || imageLoadFailed) return <Avatar.Text testID={testID} size={48} label={label} />;

  return (
    <Avatar.Image
      size={48}
      source={() => (
        <CustomImage
          style={styles.avatarImage}
          source={{ uri: photo }}
          contentFit="cover"
          testID={testID}
          onError={() => setImageLoadFailed(true)}
        />
      )}
    />
  );
}
