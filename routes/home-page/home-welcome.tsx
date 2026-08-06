import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import AvatarShowable from '@Routes/avatar/showable/showable';
import { HOME_WELCOME_TEXT } from './const';

export default function HomeWelcome() {
  const { colors } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { profileFromServer, settings } = useAppSelector(({ profile }) => profile);
  const name = profileFromServer?.name || settings.name || '';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <AvatarShowable size={44} id={userId} />
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
