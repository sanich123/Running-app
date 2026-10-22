import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';

const LazyGorhomBottomSheetModalProvider = lazy(() =>
  import('@gorhom/bottom-sheet').then(({ BottomSheetModalProvider }) => ({ default: BottomSheetModalProvider })),
);

export default function BottomSheetProvider({
  children,
  enabled,
  fallback,
}: {
  children: ReactNode;
  enabled: boolean;
  fallback: ReactNode;
}) {
  if (!enabled) return children;

  return (
    <Suspense fallback={fallback}>
      <LazyGorhomBottomSheetModalProvider>{children}</LazyGorhomBottomSheetModalProvider>
    </Suspense>
  );
}
