import { create } from 'zustand';

import { DEFAULT_MAP_RADIUS_KM } from '@/lib/constants';
import { type GeoPoint, type ReportFilter } from '@/types/report';

const DEFAULT_CENTER: GeoPoint = { latitude: -7.79564, longitude: 110.36955 };

const DEFAULT_FILTER: ReportFilter = {
  query: '',
  categories: [],
  statuses: [],
  windowDays: null,
  area: 'nearby',
  radiusKm: DEFAULT_MAP_RADIUS_KM,
};

type MapState = {
  center: GeoPoint;
  filter: ReportFilter;
  selectedId: string | null;
  sheetOpen: boolean;
  setCenter: (center: GeoPoint) => void;
  setFilter: (patch: Partial<ReportFilter>) => void;
  resetFilter: () => void;
  select: (id: string | null) => void;
  setSheetOpen: (open: boolean) => void;
};

export const useMapStore = create<MapState>((set, get) => ({
  center: DEFAULT_CENTER,
  filter: DEFAULT_FILTER,
  selectedId: null,
  sheetOpen: false,

  setCenter: (center) => set({ center }),

  setFilter: (patch) => {
    const filter = { ...get().filter, ...patch };
    set({ filter, center: DEFAULT_CENTER });
  },

  resetFilter: () => set({ filter: DEFAULT_FILTER }),

  select: (selectedId) => set({ selectedId }),

  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
}));
