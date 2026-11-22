import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { Point } from 'geojson';
import { UserRole } from './enums';
import { Report } from './report.entity';
import { ReportUpvote } from './report-upvote.entity';
import { ReportStatusLog } from './report-status-log.entity';
import { HazardZone } from './hazard-zone.entity';
import { GeofenceAlert } from './geofence-alert.entity';
import { EmergencyDocument } from './emergency-document.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 32, unique: true, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role: UserRole;

  @Column({ type: 'text', nullable: true })
  fcm_token: string | null;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  last_known_location: Point | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => Report, (report) => report.reporter)
  reports: Report[];

  @OneToMany(() => ReportUpvote, (upvote) => upvote.user)
  upvotes: ReportUpvote[];

  @OneToMany(() => ReportStatusLog, (log) => log.changed_by)
  status_logs: ReportStatusLog[];

  @OneToMany(() => HazardZone, (hazardZone) => hazardZone.created_by)
  hazard_zones: HazardZone[];

  @OneToMany(() => GeofenceAlert, (alert) => alert.user)
  geofence_alerts: GeofenceAlert[];

  @OneToMany(() => EmergencyDocument, (doc) => doc.uploaded_by)
  emergency_documents: EmergencyDocument[];
}

