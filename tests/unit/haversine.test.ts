import { formatAccuracy, formatDistance, haversineMeters } from '@/utils/geo';

const MALIOBORO = { latitude: -7.7956, longitude: 110.3695 };

describe('haversineMeters', () => {
  it('is zero for the same point', () => {
    expect(haversineMeters(MALIOBORO, { ...MALIOBORO })).toBe(0);
  });

  it('measures one degree of latitude as roughly 111.2 km', () => {
    const north = { latitude: MALIOBORO.latitude + 1, longitude: MALIOBORO.longitude };
    expect(haversineMeters(MALIOBORO, north)).toBeCloseTo(111_195, -2);
  });

  it('is symmetric', () => {
    const other = { latitude: -7.8062, longitude: 110.3614 };
    expect(haversineMeters(MALIOBORO, other)).toBeCloseTo(haversineMeters(other, MALIOBORO), 6);
  });

  it('matches a known city-to-city distance (Yogyakarta → Solo ≈ 52 km)', () => {
    const solo = { latitude: -7.5755, longitude: 110.8243 };
    expect(haversineMeters(MALIOBORO, solo) / 1000).toBeGreaterThan(50);
    expect(haversineMeters(MALIOBORO, solo) / 1000).toBeLessThan(56);
  });
});

describe('formatDistance', () => {
  it('rounds metres to the nearest ten below 1000 m', () => {
    expect(formatDistance(0)).toBe('0 m');
    expect(formatDistance(214)).toBe('210 m');
    expect(formatDistance(949)).toBe('950 m');
  });

  it('switches to kilometres once rounding reaches 1000 m', () => {
    expect(formatDistance(999)).toBe('1,0 km');
    expect(formatDistance(1_234)).toBe('1,2 km');
  });

  it('shows a dash for non-finite input', () => {
    expect(formatDistance(Number.NaN)).toBe('—');
  });
});

describe('formatAccuracy', () => {
  it('reports missing accuracy honestly', () => {
    expect(formatAccuracy(null)).toBe('tanpa akurasi');
  });

  it('rounds to whole metres', () => {
    expect(formatAccuracy(6.4)).toBe('±6 m');
    expect(formatAccuracy(120)).toBe('±120 m');
  });
});
