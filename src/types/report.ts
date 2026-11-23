import { type IconName } from '@/components/common/Icon';

export type ReportStatus = 'draft' | 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';

export type HazardLevel = 'low' | 'medium' | 'high';

export type ReportCategoryId = 'pothole' | 'streetlight' | 'sidewalk' | 'drainage' | 'public_facility';

export type ReportCategory = {
  id: ReportCategoryId;
  label: string;
  icon: IconName;
};

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

/** Everything captured at shutter time. Immutable once a capture session is confirmed. */
export type CaptureMetadata = {
  point: GeoPoint;
  accuracyM: number | null;
  /** ISO string of the GPS fix used for the report. */
  locationMeasuredAt: string;
  /** ISO string of the shutter press. */
  capturedAt: string;
  source: 'gps' | 'cached' | 'manual';
};

export type CaptureSession = {
  id: string;
  photoUri: string;
  photoWidth: number;
  photoHeight: number;
  photoBytes: number;
  metadata: CaptureMetadata;
  confirmed: boolean;
  createdAt: string;
};

export type Report = {
  id: string;
  code: string;
  authorId: string;
  authorName: string;
  categoryId: ReportCategoryId;
  title: string;
  description: string;
  hazardLevel: HazardLevel;
  status: ReportStatus;
  point: GeoPoint;
  accuracyM: number | null;
  locationMeasuredAt: string;
  capturedAt: string;
  locationConfirmed: boolean;
  address: string | null;
  photoPath: string;
  isPublic: boolean;
  notifyOnStatus: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReportMedia = {
  reportId: string;
  path: string;
  bytes: number;
  mimeType: string;
  width: number;
  height: number;
  uploadedAt: string | null;
};

export type ReportFilter = {
  query: string;
  categories: ReportCategoryId[];
  statuses: ReportStatus[];
  windowDays: 1 | 7 | 30 | null;
  area: 'nearby' | 'hazard' | 'city';
  radiusKm: number;
};

export type HazardZone = {
  id: string;
  name: string;
  kind: string;
  radiusM: number;
  center: GeoPoint;
};

export type ReportDraft = {
  session: CaptureSession;
  categoryId: ReportCategoryId;
  description: string;
  hazardLevel: HazardLevel;
  isPublic: boolean;
  notifyOnStatus: boolean;
  address: string | null;
  savedAt: string;
};

export type ReportCreationStatus =
  | 'idle'
  | 'requesting_permission'
  | 'opening_camera'
  | 'capturing'
  | 'getting_location'
  | 'preview'
  | 'location_confirmation'
  | 'ready_to_submit'
  | 'uploading'
  | 'submitted'
  | 'error'
  | 'cancelled';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isPublic: boolean;
  notifyOnStatus: boolean;
};
