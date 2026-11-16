import { Suspense } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { LABELS, ROUTES } from '@const/enums';
import { FONT_FAMILIES } from '@const/fonts';
import { useAppSelector } from '@R/typed-hooks';
import { LazyUsersSettingsIcons } from '@Routes/app-routes/const';
import FeedHeaderTitle from '@S/feed-header-title/feed-header-title';
import { IOS_HEADER_ITEM_SPACING, IOS_HEADER_ITEM_WIDTH_PROPS } from '@S/header-toolbar-const';

export default function StatisticsStack() {
  const { colors, dark } = useTheme();
  const { language } = useAppSelector(({ settings }) => settings);
  const { push } = useRouter();
  const labels = LABELS[language];

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.onSurface,
        headerUserInterfaceStyle: dark ? 'dark' : 'light',
        headerTitleStyle: {
          color: colors.primary,
          fontFamily: FONT_FAMILIES.semiBold,
          fontSize: 16,
        },
        title: Platform.OS !== 'web' ? LABELS[language].statistics : '',
        headerTitle:
          Platform.OS === 'web' ? ({ children }) => <FeedHeaderTitle>{children}</FeedHeaderTitle> : undefined,
      }}>
      <Stack.Screen
        name={ROUTES.index}
        options={{
          headerRight: () => (
            <Suspense fallback={null}>
              <LazyUsersSettingsIcons />
            </Suspense>
          ),
          title: LABELS[language].statistics,
        }}>
        {Platform.OS === 'ios' ? (
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="person.2"
              accessibilityLabel={labels.users}
              onPress={() => push(`/${ROUTES.users}`)}
            />
            <Stack.Toolbar.Spacer width={IOS_HEADER_ITEM_SPACING} />
            <Stack.Toolbar.Button
              {...IOS_HEADER_ITEM_WIDTH_PROPS}
              icon="gearshape"
              accessibilityLabel={labels.settings}
              onPress={() => push(`/${ROUTES.settings}`)}
            />
          </Stack.Toolbar>
        ) : null}
      </Stack.Screen>
    </Stack>
  );
}
