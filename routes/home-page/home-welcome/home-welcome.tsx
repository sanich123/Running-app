import { View, StyleSheet } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useGetUserProfileByUserIdQuery } from '@R/services/profile/profile';
import { useAppSelector } from '@R/typed-hooks';
import UserProfileAvatar from '@S/avatar/user-profile-avatar/user-profile-avatar';
import { HOME_WELCOME_TEXT } from '../const';

export default function HomeWelcome() {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { data: profile } = useGetUserProfileByUserIdQuery(userId, { skip: !userId });
  const name = profile?.name || '';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <UserProfileAvatar size={44} id={userId} profile={profile ?? undefined} />
      <View style={styles.copy}>
        <Text variant="titleMedium" style={styles.title}>
          {HOME_WELCOME_TEXT.greeting(name)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
          {HOME_WELCOME_TEXT.subtitle}
        </Text>
      </View>
      <IconButton icon="bell-outline" iconColor={colors.primary} size={24} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 'auto',
    maxWidth: 600,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: '100%',
  },
  copy: { flex: 1, marginLeft: 10 },
  title: { fontFamily: FONT_FAMILIES.semiBold },
  action: { margin: 0 },
});
