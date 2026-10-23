import type { ReactNode } from 'react';
import { BottomSheetModalProvider as GorhomBottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function BottomSheetProvider({
  children,
}: {
  children: ReactNode;
  enabled: boolean;
  fallback: ReactNode;
}) {
  return <GorhomBottomSheetModalProvider>{children}</GorhomBottomSheetModalProvider>;
}
