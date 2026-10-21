import { Button, Host, Label, Menu } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier } from '@expo/ui/swift-ui/modifiers';
import type { ContentActionsMenuProps } from './types';

export default function ContentActionsMenu({
  accessibilityLabel,
  testID,
  reportLabel,
  reportTestID,
  onReport,
  blockLabel,
  blockTestID,
  onBlock,
}: ContentActionsMenuProps) {
  return (
    <Host matchContents>
      <Menu
        label={<Label systemImage="ellipsis" modifiers={[accessibilityLabelModifier(accessibilityLabel)]} />}
        testID={testID}>
        <Button label={reportLabel} systemImage="flag" testID={reportTestID} onPress={onReport} />
        {onBlock && blockLabel ? (
          <Button
            label={blockLabel}
            systemImage="person.crop.circle.badge.xmark"
            testID={blockTestID}
            onPress={onBlock}
          />
        ) : null}
      </Menu>
    </Host>
  );
}
