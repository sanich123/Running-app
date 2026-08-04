import { Platform } from 'react-native';

const family = (name: string) => Platform.select({ web: `${name}, Arial, sans-serif`, default: name }) as string;

export const FONT_FAMILIES = {
  regular: family('PlusJakartaSans_400Regular'),
  medium: family('PlusJakartaSans_500Medium'),
  semiBold: family('PlusJakartaSans_600SemiBold'),
  extraBold: family('PlusJakartaSans_800ExtraBold'),
} as const;
