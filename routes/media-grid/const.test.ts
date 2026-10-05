import { getMediaGridCellSize, MEDIA_GRID_COLUMNS, MEDIA_GRID_GAP } from './const';

describe('media grid dimensions', () => {
  it('subtracts the gap between columns before calculating each cell size', () => {
    const width = 393;
    const cellSize = getMediaGridCellSize(width);

    expect(cellSize).toBe((width - MEDIA_GRID_GAP * (MEDIA_GRID_COLUMNS - 1)) / MEDIA_GRID_COLUMNS);
    expect(cellSize * MEDIA_GRID_COLUMNS + MEDIA_GRID_GAP * (MEDIA_GRID_COLUMNS - 1)).toBe(width);
  });
});
