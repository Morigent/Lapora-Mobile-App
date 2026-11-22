import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Report } from './report.entity';
import { User } from './user.entity';

@Entity('report_upvotes')
@Unique(['report_id', 'user_id'])
export class ReportUpvote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  report_id: string;

  @ManyToOne(() => Report, (report) => report.upvotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'report_id' })
  report: Report;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.upvotes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'float', nullable: true })
  user_distance_meters: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}

