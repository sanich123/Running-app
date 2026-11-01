import { getMapControlButtonSize, getMapControlButtonStyle } from './const';

describe('map control button styles', () => {
  it('selects a compact size for narrow screens and grows with available width', () => {
    expect(getMapControlButtonSize(320)).toBe(48);
    expect(getMapControlButtonSize(400)).toBe(52);
    expect(getMapControlButtonSize(430)).toBe(56);
  });

  it('uses an opaque circular surface with a subtle outline', () => {
    expect(getMapControlButtonStyle(48, '#ffffff', '#dddddd')).toEqual(
      expect.objectContaining({
        backgroundColor: '#ffffff',
        borderColor: '#dddddd',
        borderRadius: 24,
        height: 48,
        width: 48,
      }),
    );
  });
});
