export interface MapActionsProps {
  copy: { importRoute: string; downloadOfflineMaps: string; showSavedTracks: string; favoriteActivities: string };
  onImportRoute: () => void;
  onDownloadOfflineMaps: () => void;
  onShowSavedTracks: () => void;
  onShowFavoriteActivities: () => void;
}
