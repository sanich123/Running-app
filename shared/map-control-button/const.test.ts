import { getMapControlButtonSize, getMapControlButtonStyle, MAP_CONTROL_BUTTON_BACKGROUND } from './const';

describe('map control button styles', () => {
  it('selects a compact size for narrow screens and grows with available width', () => {
    expect(getMapControlButtonSize(320)).toBe(48);
    expect(getMapControlButtonSize(400)).toBe(52);
    expect(getMapControlButtonSize(430)).toBe(56);
  });

  it('uses a circular transparent surface', () => {
    expect(getMapControlButtonStyle(48)).toEqual(
      expect.objectContaining({
        backgroundColor: MAP_CONTROL_BUTTON_BACKGROUND,
        borderRadius: 24,
        height: 48,
        width: 48,
      }),
    );
  });
});
