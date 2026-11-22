import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import type { Point } from 'geojson';
import { ReportCategory, ReportStatus, SeverityLevel } from './enums';
import { User } from './user.entity';
import { ReportUpvote } from './report-upvote.entity';
import { ReportStatusLog } from './report-status-log.entity';
import { HazardZone } from './hazard-zone.entity';

@Entity('reports')
@Index(['category', 'status', 'severity'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  client_uuid: string;

  @Column({ type: 'uuid' })
  reporter_id: string;

  @ManyToOne(() => User, (user) => user.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ReportCategory })
  category: ReportCategory;

  @Column({ type: 'enum', enum: SeverityLevel })
  severity: SeverityLevel;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'float', nullable: true })
  gps_accuracy_meters: number | null;

  @Column({ type: 'text', nullable: true })
  address_text: string | null;

  @Column({ type: 'text' })
  watermarked_image_url: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  image_hash_sha256: string | null;

  @Column({ type: 'timestamptz' })
  captured_at: Date;

  @Column({ type: 'boolean', default: false })
  synced_from_vault: boolean;

  @Column({ type: 'int', default: 0 })
  upvote_count: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => ReportUpvote, (upvote) => upvote.report)
  upvotes: ReportUpvote[];

  @OneToMany(() => ReportStatusLog, (log) => log.report)
  status_logs: ReportStatusLog[];

  @OneToOne(() => HazardZone, (hazardZone) => hazardZone.source_report)
  hazard_zone: HazardZone | null;
}

