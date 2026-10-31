import type { SFSymbol } from 'expo-symbols';

export interface MapControlButtonProps {
  accessibilityLabel: string;
  androidIcon: string;
  iosSymbol: SFSymbol;
  androidOverlayIcon?: string;
  iosOverlaySymbol?: SFSymbol;
  onPress: () => void;
  testID: string;
  disabled?: boolean;
  iconColor?: string;
  loading?: boolean;
  loadingTestID?: string;
  selected?: boolean;
}
