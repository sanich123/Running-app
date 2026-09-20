import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import {
  EMOTIONS_BTNS_ICONS,
  EMOTIONS_BTNS_VALUES,
  normalizeEmotion,
} from '@Routes/save-activity-page/emotion-btns/const';
import UserAvatar from '@S/avatar/avatar';
import { getIconByTypeOfSport } from '@U/icon-utils';
import { formatDate, getHoursMinutes } from '@U/time-formatter';
import type { UserInfoProps } from './const';
import type { SPORTS_BTNS_VALUES } from '@const/sports';

export default function UserInfo({ profile, sport, date, emotion, userId, size, commentsModalRef }: UserInfoProps) {
  const { dark, colors } = useTheme();
  const { push } = useRouter();
  const { language } = useAppSelector(({ settings }) => settings);
  const normalizedEmotion = normalizeEmotion(emotion);
  const emotionBadge =
    normalizedEmotion === EMOTIONS_BTNS_VALUES.good
      ? {
          backgroundColor: colors.primaryContainer,
          color: colors.onPrimaryContainer,
          icon: EMOTIONS_BTNS_ICONS.iconHappy,
        }
      : normalizedEmotion === EMOTIONS_BTNS_VALUES.fucked
        ? {
            backgroundColor: colors.errorContainer,
            color: colors.onErrorContainer,
            icon: EMOTIONS_BTNS_ICONS.iconFucked,
          }
        : normalizedEmotion === EMOTIONS_BTNS_VALUES.normal
          ? {
              backgroundColor: colors.secondaryContainer,
              color: colors.onSecondaryContainer,
              icon: EMOTIONS_BTNS_ICONS.iconNeutral,
            }
          : null;
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
          <View style={styles.metaRow}>
            <Text
              variant="bodySmall"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.metaText, { color: colors.onSurfaceVariant }]}>
              {sport ? getIconByTypeOfSport(sport as SPORTS_BTNS_VALUES) : ''}
              {`${size === 'small' ? '' : ' '}${formatDate(date, language)} ${getHoursMinutes(date, language)}`}
            </Text>
            {emotionBadge && (
              <View
                accessible
                accessibilityLabel="Эмоция тренировки"
                testID="activity-emotion-icon"
                style={[styles.emotionBadge, { backgroundColor: emotionBadge.backgroundColor }]}>
                <Icon source={emotionBadge.icon} size={18} color={emotionBadge.color} />
              </View>
            )}
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
  emotionBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    flexShrink: 0,
    width: 32,
  },
});
