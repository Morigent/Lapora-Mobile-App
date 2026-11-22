import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGeofenceAlertDto } from './dto/create-geofence-alert.dto';
import { ReportCategory, SeverityLevel } from '../entities/enums';

@ApiTags('2. Geofencing & Scoped Storage Vault')
@Controller('api')
export class HazardZonesController {
  @Get('hazard-zones')
  @ApiOperation({
    summary:
      'Daftar zona bahaya aktif untuk fitur Geofencing perangkat warga',
    description:
      'Mengembalikan koordinat pusat (center_lat, center_lng), radius batas bahaya (radius_meters), serta pesan peringatan siaga darurat. Data ini digunakan oleh LocationManager background service di HP untuk memicu notifikasi push saat warga memasuki zona bahaya.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar zona bahaya aktif terkonfirmasi oleh BPBD/Dinas.',
  })
  getHazardZones() {
    return {
      statusCode: 200,
      total_active_zones: 3,
      data: [
        {
          id: '1c9c4882-628d-4ba6-8c4d-b0f9c2d1b5a2',
          name: 'Zona Merah Bencana Longsor Payung - Pujon',
          hazard_type: ReportCategory.LANDSLIDE,
          severity: SeverityLevel.CRITICAL,
          center_point: {
            type: 'Point',
            coordinates: [112.4921, -7.8643],
          },
          center_lat: -7.8643,
          center_lng: 112.4921,
          radius_meters: 600,
          alert_title: 'PERINGATAN BAHAYA LONGSOR AKTIF',
          alert_message:
            'Anda berada di zona rawan pergerakan tanah tebing Payung. Segera kurangi kecepatan dan hindari berhenti di bahu jalan tebing.',
          evacuation_guide:
            'Arahkan kendaraan menjauhi tebing menuju pos pantau perbatasan Songgoriti atau rest area Pujon.',
          is_active: true,
          expires_at: '2026-11-20T23:59:59.000Z',
          created_at: '2026-11-17T06:00:00.000Z',
        },
        {
          id: '2a1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          name: 'Zona Siaga Banjir Luapan DAS Brantas Muharto & Jodipan',
          hazard_type: ReportCategory.FLOOD,
          severity: SeverityLevel.HIGH,
          center_point: {
            type: 'Point',
            coordinates: [112.6391, -7.9942],
          },
          center_lat: -7.9942,
          center_lng: 112.6391,
          radius_meters: 450,
          alert_title: 'WASPADA LUAPAN AIR SUNGAI BRANTAS',
          alert_message:
            'Debit air sungai melampaui batas normal. Warga di bantaran sungai diminta mengamankan dokumen penting ke lantai atas atau titik evakuasi.',
          evacuation_guide:
            'Kumpul di Balai RW 02 Kotalama atau Lapangan Mergosono di dataran yang lebih tinggi.',
          is_active: true,
          expires_at: '2026-11-18T18:00:00.000Z',
          created_at: '2026-11-17T05:30:00.000Z',
        },
        {
          id: '3b2c1a0f-9e8d-7c6b-5a4f-3e2d1c0b9a8f',
          name: 'Zona Rawan Cuaca Ekstrem Jalur Hijau Ijen - Semeru',
          hazard_type: ReportCategory.FALLEN_TREE,
          severity: SeverityLevel.MEDIUM,
          center_point: {
            type: 'Point',
            coordinates: [112.6245, -7.9735],
          },
          center_lat: -7.9735,
          center_lng: 112.6245,
          radius_meters: 350,
          alert_title: 'WASPADA POHON TUA & ANGIN KENCANG',
          alert_message:
            'Terpantau dahan pohon rapuh di sepanjang jalur boulevard Ijen setelah angin puting beliung.',
          evacuation_guide:
            'Hindari memarkir kendaraan di bawah pohon besar dan papan reklame besar.',
          is_active: true,
          expires_at: '2026-11-17T20:00:00.000Z',
          created_at: '2026-11-17T06:15:00.000Z',
        },
      ],
    };
  }

  @Post('geofence-alerts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Catat alert ketika warga memasuki radius zona bahaya merah',
    description:
      'Dipanggil otomatis oleh perangkat mobile saat background geofence listener mendeteksi transisi batas radius bahaya (ENTER, EXIT, atau DWELL).',
  })
  @ApiBody({ type: CreateGeofenceAlertDto })
  @ApiResponse({
    status: 201,
    description: 'Log event geofence berhasil dicatat.',
  })
  recordGeofenceAlert(@Body() dto: CreateGeofenceAlertDto) {
    return {
      statusCode: 201,
      message: 'Geofence alert event berhasil disimpan ke telemetri sistem.',
      data: {
        id: '9f8a7b6c-5d4e-3f2a-1b0c-9d8e7f6a5b4c',
        hazard_zone_id: dto.hazard_zone_id,
        user_id: 'a0b1c2d3-e4f5-4a5b-8c9d-0e1f2a3b4c5d',
        event_type: dto.event_type,
        detected_lat: dto.detected_lat,
        detected_lng: dto.detected_lng,
        distance_to_center_meters: dto.distance_to_center_meters,
        triggered_at: new Date().toISOString(),
        notification_dispatched: true,
      },
    };
  }

  @Get('vault/emergency-documents')
  @ApiOperation({
    summary:
      'Daftar dokumen SOP mitigasi darurat untuk diunduh ke Scoped Storage Vault',
    description:
      'Menyediakan daftar berkas PDF panduan evakuasi dan mitigasi darurat (SDG 11) beserta checksum SHA-256 untuk verifikasi integritas berkas offline di Scoped Storage aplikasi.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Daftar berkas SOP mitigasi darurat yang wajib di-cache offline.',
  })
  getEmergencyDocuments() {
    return {
      statusCode: 200,
      total: 3,
      data: [
        {
          id: '551e8400-e29b-41d4-a716-446655440011',
          title: 'SOP Evakuasi Darurat Banjir & Siaga Bencana DAS Brantas Malang',
          category: ReportCategory.FLOOD,
          file_url:
            'https://storage.civicpulse.id/vault/sop-evakuasi-banjir-malang-v1.2.pdf',
          file_size_bytes: 2458900,
          checksum_sha256:
            '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          version: '1.2',
          is_mandatory_offline: true,
          updated_at: '2026-11-10T08:00:00.000Z',
        },
        {
          id: '662e8400-e29b-41d4-a716-446655440022',
          title:
            'Buku Panduan Titik Kumpul & Jalur Evakuasi Gempa Bumi Malang Raya',
          category: ReportCategory.EARTHQUAKE,
          file_url:
            'https://storage.civicpulse.id/vault/panduan-gempa-bumi-malang-v2.0.pdf',
          file_size_bytes: 3891200,
          checksum_sha256:
            '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          version: '2.0',
          is_mandatory_offline: true,
          updated_at: '2026-11-12T10:30:00.000Z',
        },
        {
          id: '773e8400-e29b-41d4-a716-446655440033',
          title:
            'Protokol Mitigasi Pohon Tumbang & Cuaca Ekstrem Jalur Hijau Kota',
          category: ReportCategory.FALLEN_TREE,
          file_url:
            'https://storage.civicpulse.id/vault/protokol-cuaca-ekstrem-v1.0.pdf',
          file_size_bytes: 1540300,
          checksum_sha256:
            '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          version: '1.0',
          is_mandatory_offline: false,
          updated_at: '2026-11-15T14:00:00.000Z',
        },
      ],
    };
  }
}

