import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReportCategory, SeverityLevel } from '../../entities/enums';

export class CreateReportDto {
  @ApiProperty({
    description: 'Idempotency Key dari Scoped Storage Document Vault di HP',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  client_uuid: string;

  @ApiProperty({
    description: 'Judul laporan kerusakan atau mitigasi bencana',
    example: 'Jalan Ambles dan Retak Parah di Jl. Ijen Malang',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Deskripsi detail situasi kerusakan atau kondisi bencana',
    example:
      'Aspal jalan retak sedalam 30 cm setelah hujan lebat, sangat membahayakan pengendara roda dua.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Kategori laporan infrastruktur atau bencana alam',
    enum: ReportCategory,
    example: ReportCategory.ROAD_DAMAGE,
  })
  @IsEnum(ReportCategory)
  @IsNotEmpty()
  category: ReportCategory;

  @ApiProperty({
    description: 'Tingkat keparahan dampak (LOW, MEDIUM, HIGH, CRITICAL)',
    enum: SeverityLevel,
    example: SeverityLevel.HIGH,
  })
  @IsEnum(SeverityLevel)
  @IsNotEmpty()
  severity: SeverityLevel;

  @ApiProperty({
    description: 'Koordinat lintang (Latitude) lokasi laporan',
    example: -7.978645,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Koordinat bujur (Longitude) lokasi laporan',
    example: 112.631784,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Akurasi GPS perangkat dalam meter',
    example: 4.8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gps_accuracy_meters?: number;

  @ApiProperty({
    description:
      'Waktu pengambilan foto dalam format ISO8601 untuk validasi watermark kamera',
    example: '2026-11-17T07:15:00.000Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  captured_at: string;

  @ApiPropertyOptional({
    description:
      'Menandai apakah laporan disinkronkan secara otomatis dari offline Scoped Storage Vault',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  @IsBoolean()
  synced_from_vault?: boolean;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description:
      'Berkas foto asli dengan watermark tamper-proof (koordinat, timestamp, hash)',
  })
  watermarked_image: any;
}

