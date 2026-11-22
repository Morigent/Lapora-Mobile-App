import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReportCategory } from './enums';
import { User } from './user.entity';

@Entity('emergency_documents')
export class EmergencyDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  uploaded_by_id: string;

  @ManyToOne(() => User, (user) => user.emergency_documents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploaded_by: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'enum', enum: ReportCategory })
  category: ReportCategory;

  @Column({ type: 'text' })
  file_url: string;

  @Column({ type: 'int' })
  file_size_bytes: number;

  @Column({ type: 'varchar', length: 64 })
  checksum_sha256: string;

  @Column({ type: 'varchar', length: 32, default: '1.0' })
  version: string;

  @Column({ type: 'boolean', default: true })
  is_mandatory_offline: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

