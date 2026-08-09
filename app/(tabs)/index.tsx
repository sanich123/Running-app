import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import FeedHeaderTitle from '@Routes/feed-header-title/feed-header-title';
import Feed from '@Routes/home-page/home-page';
import UsersSettingsIcons from '@Routes/users-settings-icons/users-settings-icons';

export default function HomePage() {
  const { colors } = useTheme();
  const { language } = useAppSelector(({ language }) => language);

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.onSurface,
          headerTitleStyle: {
            color: colors.primary,
            fontFamily: FONT_FAMILIES.semiBold,
            fontSize: 16,
          },
          headerTitle:
            Platform.OS === 'web' ? () => <FeedHeaderTitle>{LABELS[language].feed}</FeedHeaderTitle> : undefined,
          headerRight: () => <UsersSettingsIcons />,
          title: LABELS[language].feed,
        }}
      />
      <Feed />
    </>
  );
}
