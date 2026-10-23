import type { UserReportTargetType } from '@R/services/moderation/types';

export interface ReportContentDialogProps {
  visible: boolean;
  targetType: UserReportTargetType;
  targetId: string;
  onDismiss: () => void;
}
