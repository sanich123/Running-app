import { useAuth } from '@A/context/auth-context';
import AvatarShowable from '@C/avatar/showable/showable';
import { ROUTES } from '@const/enums';
import AntDesign from '@expo/vector-icons/AntDesign';
import { usePathname } from 'expo-router';
import { Fragment } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { TouchableRipple, useTheme } from 'react-native-paper';

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
  const { user } = useAuth();
  const pathname = usePathname();
  const icons = {
    home: (props: { color: string }) => <AntDesign name="home" color={colors.primary} size={45} />,
    activity: (props: { color: string }) => <AntDesign name="playcircleo" size={45} color="tomato" />,
    profile: (props: { color: string }) => <AvatarShowable size={45} id={`${user?.id}`} {...props} />,
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: Platform.OS === 'ios' ? 70 : 'auto',
          backgroundColor: colors.secondaryContainer,
          display:
            pathname.includes(ROUTES.manualActivity) ||
            pathname.includes(ROUTES.changePassword) ||
            pathname.includes(ROUTES.activity) ||
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
    borderRadius: 10,
    paddingVertical: 2,
  },
});
