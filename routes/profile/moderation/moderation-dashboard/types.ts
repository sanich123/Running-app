import type { MODERATION_DASHBOARD_COPY } from '../const';
import type { ModerationTab, PendingDecision, ReportFilter } from '../types';
import type { LANGUAGES } from '@const/enums';
import type {
  ModerationAppealItem,
  ModerationReportContext,
  ModerationReportDetails,
  ModerationReportItem,
} from '@R/services/moderation/types';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export type ModerationDashboardCopy =
  (typeof MODERATION_DASHBOARD_COPY)[LANGUAGES.english] | (typeof MODERATION_DASHBOARD_COPY)[LANGUAGES.russian];
export type ModerationDashboardError = FetchBaseQueryError | SerializedError | undefined;

export interface ModerationReportQueueProps {
  activeTab: ModerationTab;
  isWideLayout: boolean;
  showQueue: boolean;
  hasQueueItems: boolean;
  statusFilter: ReportFilter;
  onStatusFilterChange: (filter: ReportFilter) => void;
  reports: ModerationReportItem[];
  appeals: ModerationAppealItem[];
  selectedReportId: string;
  selectedAppealId: string;
  isLoading: boolean;
  isError: boolean;
  error: ModerationDashboardError;
  refetch: () => object;
  language: LANGUAGES;
  copy: ModerationDashboardCopy;
  onSelectReport: (reportId: string) => void;
  onSelectAppeal: (appealId: string, reportId: string) => void;
}

export interface ModerationReportDetailProps {
  selectedReportId: string;
  isLoading: boolean;
  isError: boolean;
  error: ModerationDashboardError;
  refetch: () => object;
  reportDetails?: ModerationReportDetails;
  selectedAppeal?: ModerationAppealItem;
  activeTab: ModerationTab;
  copy: ModerationDashboardCopy;
  language: LANGUAGES;
  onOpenDecision: (decision: PendingDecision) => void;
}

export interface ModerationReportContextProps {
  report: ModerationReportItem;
  context: ModerationReportContext | null;
  copy: ModerationDashboardCopy;
}

export interface ModerationDecisionDialogProps {
  pendingDecision: PendingDecision | null;
  isSaving: boolean;
  decisionNote: string;
  onDecisionNoteChange: (note: string) => void;
  suspensionDays: string;
  onSuspensionDaysChange: (days: string) => void;
  language: LANGUAGES;
  copy: ModerationDashboardCopy;
  onDismiss: () => void;
  onConfirm: () => void;
}
