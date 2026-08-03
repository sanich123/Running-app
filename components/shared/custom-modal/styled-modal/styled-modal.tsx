import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from 'react-native-paper';
import type { ModalControls } from '../types';

export default function StyledModal({
  controlRef,
  snapPointIndex,
  snapPoints,
  children,
}: PropsWithChildren<ModalControls>) {
  const { colors } = useTheme();
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />,
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
      handleStyle={{ backgroundColor: colors.background, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.primary }}>
      {children}
    </BottomSheetModal>
  );
}
