export type MapPageSearchParams = Partial<Record<'id' | 'replay' | 'userId', string>>;

export interface MapPageProps {
  onVideoExportStateChange?: (isExporting: boolean) => void;
}
