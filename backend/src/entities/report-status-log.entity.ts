import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportStatus } from './enums';
import { Report } from './report.entity';
import { User } from './user.entity';

@Entity('report_status_logs')
export class ReportStatusLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @ManyToOne(() => Report, (report) => report.status_logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'uuid', nullable: true })
  changed_by_id: string | null;

  @ManyToOne(() => User, (user) => user.status_logs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'changed_by_id' })
  changed_by: User | null;

  @Column({ type: 'enum', enum: ReportStatus })
  previous_status: ReportStatus;

  @Column({ type: 'enum', enum: ReportStatus })
  new_status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', nullable: true })
  resolution_image_url: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}

