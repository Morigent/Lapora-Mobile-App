import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { GeofenceEventType } from '../../entities/enums';

export class CreateGeofenceAlertDto {
  @ApiProperty({
    description: 'UUID Zona Bahaya (Hazard Zone) yang memicu deteksi geofence',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  hazard_zone_id: string;

  @ApiProperty({
    description: 'Jenis event geofence: ENTER (masuk), EXIT (keluar), atau DWELL (berada di dalam radius)',
    enum: GeofenceEventType,
    example: GeofenceEventType.ENTER,
  })
  @IsEnum(GeofenceEventType)
  @IsNotEmpty()
  event_type: GeofenceEventType;

  @ApiProperty({
    description: 'Koordinat lintang (Latitude) lokasi perangkat saat event terjadi',
    example: -7.9825,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  detected_lat: number;

  @ApiProperty({
    description: 'Koordinat bujur (Longitude) lokasi perangkat saat event terjadi',
    example: 112.6308,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  detected_lng: number;

  @ApiProperty({
    description: 'Jarak perkiraan perangkat ke titik pusat zona bahaya dalam meter',
    example: 120.5,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  distance_to_center_meters: number;
}

