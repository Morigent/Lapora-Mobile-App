import { formatCoordinates } from '@/utils/date';

describe('formatCoordinates — the single renderer for evidence coordinates (FR-06)', () => {
  it('keeps five decimals so two fixes metres apart never look identical', () => {
    expect(formatCoordinates(-7.79560, 110.36950)).toBe('−7.79560, 110.36950');
    expect(formatCoordinates(-7.79561, 110.36950)).not.toBe(formatCoordinates(-7.79560, 110.36950));
  });

  it('marks southern and western hemispheres with the same glyph on both axes', () => {
    expect(formatCoordinates(-6.2, -106.8)).toBe('−6.20000, −106.80000');
  });

  it('leaves northern and eastern hemispheres unsigned', () => {
    expect(formatCoordinates(51.5, 0.12)).toBe('51.50000, 0.12000');
  });
});
