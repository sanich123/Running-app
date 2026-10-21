import type { PropsWithChildren, RefObject } from 'react';
import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export default function StyledModal({
  controlRef,
  snapPointIndex,
  snapPoints,
  children,
}: PropsWithChildren<{
  controlRef: RefObject<BottomSheetModal | null>;
  snapPointIndex: number;
  snapPoints: string[];
}>) {
  const { colors } = useTheme();
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
    [],
  );
  return (
    <BottomSheetModal
      enableDynamicSizing={false}
      ref={controlRef}
      index={snapPointIndex}
      style={{ maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleStyle={{ backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      {children}
    </BottomSheetModal>
  );
}
