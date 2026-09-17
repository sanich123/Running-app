import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import UserAvatar from '@S/avatar/avatar';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import type { UserInfoProps } from './const';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function UserInfo({ profile, sport, date, userId, size, commentsModalRef }: UserInfoProps) {
  const { dark, colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => {
        const modal = commentsModalRef?.current;
        if (modal && typeof modal.close === 'function') {
          modal.close();
        }

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
              }}>{`${profile?.name} ${profile?.surname ?? ''}`}</Text>
          </View>
          <View>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {sport ? getIconByTypeOfSport(sport as SPORTS_BTNS_VALUES) : ''}
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
});
