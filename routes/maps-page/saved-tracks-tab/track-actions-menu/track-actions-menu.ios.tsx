import { Button, Host, Label, Menu } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier } from '@expo/ui/swift-ui/modifiers';
import { useTheme } from 'react-native-paper';
import type { TrackActionsMenuProps } from './types';

export default function TrackActionsMenu({ accessibilityLabel, testID, actions }: TrackActionsMenuProps) {
  const { colors } = useTheme();

  return (
    <Host matchContents seedColor={colors.primary}>
      <Menu
        label={<Label systemImage="ellipsis" modifiers={[accessibilityLabelModifier(accessibilityLabel)]} />}
        testID={testID}>
        {actions.map(({ label, testID: actionTestID, systemImage, onPress, destructive }) => (
          <Button
            key={actionTestID}
            label={label}
            systemImage={systemImage}
            role={destructive ? 'destructive' : undefined}
            testID={actionTestID}
            onPress={onPress}
          />
        ))}
      </Menu>
    </Host>
  );
}
