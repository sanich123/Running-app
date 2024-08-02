import { CustomImage } from '@C/custom-image/custom-image';
import { useAppSelector } from '@R/typed-hooks';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import { ROUTES } from '@const/enums';
import { usePathname, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { UserInfoProps } from './const';

export default function UserInfo({ profile, sport, date, userId, size }: UserInfoProps) {
  const { dark } = useTheme();
  const { push } = useRouter();
  const pathname = usePathname();
  const place = pathname.includes(ROUTES.profile) ? ROUTES.profile : ROUTES.home;
  const { language } = useAppSelector(({ language }) => language);

  return (
    <TouchableRipple
      rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
      onPress={() => push(`/${place}/${ROUTES.profile}/${userId}`)}
      borderless
      style={{ paddingVertical: 5, paddingHorizontal: 5 }}>
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
              variant={size === 'large' ? 'titleLarge' : 'bodyLarge'}>{`${profile?.name} ${profile?.surname}`}</Text>
          </View>
          <View>
            <Text variant="bodyMedium">
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
    width: 50,
    height: 50,
    borderRadius: 70,
  },
  avatarImageSmall: {
    width: 35,
    height: 35,
    borderRadius: 70,
  },
});
