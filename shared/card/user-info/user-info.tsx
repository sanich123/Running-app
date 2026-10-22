import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { profileApi } from '@R/services/profile/profile';
import { useAppDispatch, useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/user-avatar/user-avatar';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { USER_INFO_FALLBACK_NAME, type UserInfoProps } from './const';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function UserInfo({ profile, sport, date, userId, size, commentsModalRef }: UserInfoProps) {
  const { colors } = useTheme();
  const { push } = useRouter();
  const dispatch = useAppDispatch();
  const { language } = useAppSelector(({ settings }) => settings);
  const displayName = [profile?.name, profile?.surname]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
  const displayNameOrFallback = displayName || USER_INFO_FALLBACK_NAME[language];

  return (
    <TouchableRipple
      onPress={() => {
        const modal = commentsModalRef?.current;
        if (modal && typeof modal.close === 'function') {
          modal.close();
        }

        void dispatch(profileApi.util.prefetch('getUserProfileByUserId', userId, { ifOlderThan: 60 }));
        push(`/${ROUTES.profile}/${userId}`);
      }}
      borderless
      style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
      <View style={styles.userInfoWrapper}>
        <UserAvatar
          size={size === 'small' ? 35 : 40}
          profilePhoto={profile?.profilePhoto}
          name={profile?.name}
          surname={profile?.surname}
          placeholder={profile?.profilePhotoBlurhash}
          cachePolicy="memory-disk"
          recyclingKey={userId}
          transition={0}
        />
        <View style={styles.textWrapper}>
          <View style={styles.nameWrapper}>
            <Text
              variant={size === 'large' ? 'titleSmall' : 'bodyMedium'}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.onSurface,
                fontFamily: FONT_FAMILIES.semiBold,
              }}>
              {displayNameOrFallback}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text
              variant="bodySmall"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
              {sport ? getIconByTypeOfSport(sport as SPORTS_BTNS_VALUES, 15, colors.onSurfaceVariant) : ''}
              {`${size === 'small' ? '' : ' '}${formatDate(date, language)} ${getHoursMinutes(date, language)}`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  userInfoWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textWrapper: {
    flex: 1,
    minWidth: 0,
  },
  nameWrapper: {
    minWidth: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  metaText: {
    flex: 1,
    minWidth: 0,
  },
});
