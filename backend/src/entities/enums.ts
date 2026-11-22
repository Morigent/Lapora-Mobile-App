export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN',
}

export enum ReportCategory {
  ROAD_DAMAGE = 'ROAD_DAMAGE',
  BRIDGE_DAMAGE = 'BRIDGE_DAMAGE',
  DRAINAGE_BLOCKED = 'DRAINAGE_BLOCKED',
  FALLEN_TREE = 'FALLEN_TREE',
  FLOOD = 'FLOOD',
  LANDSLIDE = 'LANDSLIDE',
  FIRE = 'FIRE',
  EARTHQUAKE = 'EARTHQUAKE',
}

export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum GeofenceEventType {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
  DWELL = 'DWELL',
}

