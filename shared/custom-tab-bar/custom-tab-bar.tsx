import { Fragment } from 'react';
import { View, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { Icon, TouchableRipple, useTheme } from 'react-native-paper';
import { ROUTES } from '@const/enums';
import { useAppSelector } from '@R/typed-hooks';
import AvatarShowable from '@S/avatar/showable/showable';

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  const { colors, dark } = useTheme();
  const { userId } = useAppSelector(({ auth }) => auth);
  const { profileFromServer } = useAppSelector(({ profile }) => profile);
  const pathname = usePathname();
  const icons = {
    home: (props: { color: string }) => <Icon source="home-outline" color={props.color} size={30} />,
    activity: (props: { color: string }) => <Icon source="run" size={30} color={props.color} />,
    profile: (props: { color: string }) => (
      <AvatarShowable size={45} id={userId} profile={profileFromServer} {...props} />
    ),
    statistic: (props: { color: string }) => <Icon source="chart-donut" size={30} color={props.color} />,
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: Platform.OS === 'ios' ? 70 : 'auto',
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          elevation: 3,
          display:
            pathname.includes(ROUTES.manualActivity) ||
            pathname.includes(ROUTES.changePassword) ||
            pathname.slice(1) === ROUTES.activity ||
            Platform.OS === 'web'
              ? 'none'
              : 'flex',
        },
      ]}>
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Fragment key={`${route.name}+${route.key}`}>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabBarBtn}>
                {icons[route.name as keyof typeof icons]({ color: isFocused ? colors.primary : colors.secondary })}
              </TouchableOpacity>
            ) : (
              <TouchableRipple
                rippleColor={`rgba(${dark ? '255, 255, 255' : '0, 0, 0'}, .08)`}
                borderless
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabBarBtn}>
                {icons[route.name as keyof typeof icons]({ color: isFocused ? colors.primary : colors.secondary })}
              </TouchableRipple>
            )}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabBarBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 8,
  },
});
