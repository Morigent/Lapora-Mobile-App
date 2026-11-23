import { gridLines, metersPerDegLng, projectPoint, radiusBand, roadPath } from '@/components/map/mapGeometry';

const CENTER = { latitude: -7.7956, longitude: 110.3695 };
const WIDTH = 320;
const HEIGHT = 240;
const RADIUS_KM = 1;

describe('projectPoint — hand-drawn map marker placement', () => {
  it('puts the centre of the radius at the centre of the canvas', () => {
    expect(projectPoint(CENTER, CENTER, RADIUS_KM, WIDTH, HEIGHT)).toEqual({ x: 160, y: 120 });
  });

  it('places north above and east to the right of the centre', () => {
    const north = projectPoint({ latitude: CENTER.latitude + 0.001, longitude: CENTER.longitude }, CENTER, RADIUS_KM, WIDTH, HEIGHT);
    const east = projectPoint({ latitude: CENTER.latitude, longitude: CENTER.longitude + 0.001 }, CENTER, RADIUS_KM, WIDTH, HEIGHT);

    expect(north.y).toBeLessThan(120);
    expect(north.x).toBeCloseTo(160, 6);
    expect(east.x).toBeGreaterThan(160);
    expect(east.y).toBeCloseTo(120, 6);
  });

  it('lands a point exactly one radius away on the canvas edge', () => {
    const edgeLat = CENTER.latitude + RADIUS_KM * 1000 / 110_540;
    const top = projectPoint({ latitude: edgeLat, longitude: CENTER.longitude }, CENTER, RADIUS_KM, WIDTH, HEIGHT);

    expect(top.y).toBeCloseTo(0, 6);
  });

  it('zooms with the radius: half the radius doubles the offset', () => {
    const point = { latitude: CENTER.latitude + 0.002, longitude: CENTER.longitude };
    const wide = projectPoint(point, CENTER, RADIUS_KM, WIDTH, HEIGHT);
    const tight = projectPoint(point, CENTER, RADIUS_KM / 2, WIDTH, HEIGHT);

    expect(120 - tight.y).toBeCloseTo(2 * (120 - wide.y), 6);
  });

  it('keeps far-away points finite instead of collapsing the projection', () => {
    const far = projectPoint({ latitude: -8.2, longitude: 111.0 }, CENTER, RADIUS_KM, WIDTH, HEIGHT);
    expect(Number.isFinite(far.x)).toBe(true);
    expect(Number.isFinite(far.y)).toBe(true);
  });
});

describe('radiusBand', () => {
  it('reports metres from the centre, matching the projection scale', () => {
    expect(radiusBand(CENTER, CENTER)).toBe(0);
    const north = { latitude: CENTER.latitude + 0.001, longitude: CENTER.longitude };
    expect(radiusBand(north, CENTER)).toBeCloseTo(110.54, 1);
  });

  it('is symmetric in both axes', () => {
    const point = { latitude: CENTER.latitude + 0.001, longitude: CENTER.longitude + 0.001 };
    const mirrored = { latitude: CENTER.latitude - 0.001, longitude: CENTER.longitude - 0.001 };
    expect(radiusBand(point, CENTER)).toBeCloseTo(radiusBand(mirrored, CENTER), 6);
  });
});

describe('metersPerDegLng', () => {
  it('shrinks towards the poles and never returns zero', () => {
    expect(metersPerDegLng(0)).toBeCloseTo(111_320, 0);
    expect(metersPerDegLng(60)).toBeLessThan(metersPerDegLng(0));
    expect(metersPerDegLng(90)).toBeGreaterThan(0);
  });
});

describe('gridLines', () => {
  it('draws interior lines only, in both directions', () => {
    const path = gridLines(100, 80, 20);
    expect(path).toBe('M20 0 V80 M40 0 V80 M60 0 V80 M80 0 V80 M0 20 H100 M0 40 H100 M0 60 H100');
  });

  it('returns nothing when a single cell covers the canvas', () => {
    expect(gridLines(20, 20, 40)).toBe('');
  });
});

describe('roadPath', () => {
  it('emits one sub-path per road, starting with a move command', () => {
    expect(
      roadPath([
        { width: 3, points: [{ x: 0, y: 0 }, { x: 10.25, y: 4 }] },
        { width: 2, points: [{ x: 5, y: 5 }] },
      ]),
    ).toEqual(['M0.0 0.0 L10.3 4.0', 'M5.0 5.0']);
  });
});
