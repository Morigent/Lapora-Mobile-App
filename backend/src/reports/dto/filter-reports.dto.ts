import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  ReportCategory,
  ReportStatus,
  SeverityLevel,
} from '../../entities/enums';

export class FilterReportsDto {
  @ApiPropertyOptional({
    description:
      'Kata kunci pencarian judul atau deskripsi laporan (digunakan oleh RxJS debounce filter di aplikasi)',
    example: 'jalan ambles',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan kategori kerusakan atau bencana',
    enum: ReportCategory,
  })
  @IsOptional()
  @IsEnum(ReportCategory)
  category?: ReportCategory;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan tingkat keparahan',
    enum: SeverityLevel,
  })
  @IsOptional()
  @IsEnum(SeverityLevel)
  severity?: SeverityLevel;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan status verifikasi dan penanganan',
    enum: ReportStatus,
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    description: 'Koordinat lintang (Latitude) pusat area pada Peta Interaktif',
    example: -7.978645,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Koordinat bujur (Longitude) pusat area pada Peta Interaktif',
    example: 112.631784,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional({
    description:
      'Radius pencarian spasial dari titik pusat peta dalam satuan meter (default: 5000 meter)',
    example: 5000,
    default: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius_meters?: number = 5000;
}

