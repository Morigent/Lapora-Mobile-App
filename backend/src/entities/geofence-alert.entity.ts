import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GeofenceEventType } from './enums';
import { HazardZone } from './hazard-zone.entity';
import { User } from './user.entity';

@Entity('geofence_alerts')
export class GeofenceAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  hazard_zone_id: string;

  @ManyToOne(() => HazardZone, (zone) => zone.alerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hazard_zone_id' })
  hazard_zone: HazardZone;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.geofence_alerts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: GeofenceEventType,
  })
  event_type: GeofenceEventType;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  detected_lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  detected_lng: number;

  @Column({ type: 'float' })
  distance_to_center_meters: number;

  @CreateDateColumn({ type: 'timestamptz' })
  triggered_at: Date;
}

