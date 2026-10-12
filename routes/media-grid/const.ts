export const MEDIA_GRID_COLUMNS = 4;
export const MEDIA_GRID_GAP = 3;
export const MEDIA_GRID_PAGE_SIZE = 28;

export function getMediaGridCellSize(width: number) {
  return (width - MEDIA_GRID_GAP * (MEDIA_GRID_COLUMNS - 1)) / MEDIA_GRID_COLUMNS;
}
