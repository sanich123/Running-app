import { Button, Host, Label, Menu } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier } from '@expo/ui/swift-ui/modifiers';
import type { TrackActionsMenuProps } from './types';

export default function TrackActionsMenu({ accessibilityLabel, testID, actions }: TrackActionsMenuProps) {
  return (
    <Host matchContents>
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
