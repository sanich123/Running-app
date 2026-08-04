import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';
import { CustomImage } from '@C/custom-image/custom-image';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import type { UserInfoProps } from './const';

export default function UserInfo({ profile, sport, date, userId, size, commentsModalRef }: UserInfoProps) {
  const { dark, colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ language }) => language);
  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => {
        if (commentsModalRef?.current) {
          commentsModalRef?.current?.close();
        }

        push(`/(protected)/profile/${userId}`);
      }}
      borderless
      style={{ paddingVertical: 10, paddingHorizontal: 12 }}>
      <View style={styles.userInfoWrapper}>
        <CustomImage
          style={[size === 'small' ? styles.avatarImageSmall : styles.avatarImageBig]}
          source={{ uri: profile?.profilePhoto }}
          placeholder={profile?.profilePhotoBlurhash}
          contentFit="cover"
        />
        <View>
          <View>
            <Text
              variant={size === 'large' ? 'titleSmall' : 'bodyMedium'}
              style={{
                color: colors.onSurface,
                fontFamily: FONT_FAMILIES.semiBold,
              }}>{`${profile?.name} ${profile?.surname ?? ''}`}</Text>
          </View>
          <View>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {sport ? getIconByTypeOfSport(sport) : ''}
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
  avatarImageBig: {
    width: 40,
    height: 40,
    borderRadius: 70,
  },
  avatarImageSmall: {
    width: 35,
    height: 35,
    borderRadius: 70,
  },
});
