import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import type { Point } from 'geojson';
import { ReportCategory, SeverityLevel } from './enums';
import { User } from './user.entity';
import { Report } from './report.entity';
import { GeofenceAlert } from './geofence-alert.entity';

@Entity('hazard_zones')
export class HazardZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @ManyToOne(() => User, (user) => user.hazard_zones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @Column({ type: 'uuid', nullable: true })
  source_report_id: string | null;

  @OneToOne(() => Report, (report) => report.hazard_zone, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'source_report_id' })
  source_report: Report | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ReportCategory })
  hazard_type: ReportCategory;

  @Column({ type: 'enum', enum: SeverityLevel })
  severity: SeverityLevel;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  center_point: Point;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  center_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  center_lng: number;

  @Column({ type: 'int', default: 500 })
  radius_meters: number;

  @Column({ type: 'varchar', length: 255 })
  alert_title: string;

  @Column({ type: 'text' })
  alert_message: string;

  @Column({ type: 'text', nullable: true })
  evacuation_guide: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => GeofenceAlert, (alert) => alert.hazard_zone)
  alerts: GeofenceAlert[];
}

