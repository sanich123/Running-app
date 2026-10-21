import { useState } from 'react';
import { IconButton, Menu } from 'react-native-paper';
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
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Menu
      visible={isVisible}
      onDismiss={() => setIsVisible(false)}
      anchor={
        <IconButton
          icon="dots-vertical"
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          testID={testID}
          onPress={() => setIsVisible(true)}
        />
      }>
      <Menu.Item
        leadingIcon="flag-outline"
        title={reportLabel}
        testID={reportTestID}
        onPress={() => {
          setIsVisible(false);
          onReport();
        }}
      />
      {onBlock && blockLabel ? (
        <Menu.Item
          leadingIcon="account-cancel-outline"
          title={blockLabel}
          testID={blockTestID}
          onPress={() => {
            setIsVisible(false);
            onBlock();
          }}
        />
      ) : null}
    </Menu>
  );
}
