export interface StartBtnProps {
  isReadyToRecordLocation: boolean;
  isGettingLocation?: boolean;
  onTrackingActionInProgressChange?: (isInProgress: boolean) => void;
}
