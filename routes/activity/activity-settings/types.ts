import type { RefObject } from 'react';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export interface ActivitySettingsProps {
  settingsModalRef: RefObject<BottomSheetModal | null>;
  locationInfoModalRef?: RefObject<BottomSheetModal | null>;
}
