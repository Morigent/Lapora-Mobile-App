import 'multer';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Express } from 'express';
import {
  ReportCategory,
  ReportStatus,
  SeverityLevel,
} from '../entities/enums';
import { CreateReportDto } from './dto/create-report.dto';
import { FilterReportsDto } from './dto/filter-reports.dto';

@ApiTags('1. Reports, Interactive Map & RxJS Filter')
@Controller('api/reports')
export class ReportsController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('watermarked_image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Kirim laporan baru dengan foto ber-watermark (Idempotency Scoped Storage Vault)',
    description:
      'Menerima payload multipart/form-data dari aplikasi mobile. Menggunakan client_uuid sebagai Idempotency Key agar laporan dari antrean offline tidak terduplikasi saat sinkronisasi ulang.',
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Laporan berhasil dibuat dan diverifikasi watermarknya.',
    schema: {
      example: {
        statusCode: 201,
        message: 'Laporan berhasil disimpan dan masuk ke antrean verifikasi.',
        data: {
          id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
          client_uuid: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Jalan Ambles dan Retak Parah di Jl. Ijen Malang',
          description:
            'Aspal jalan retak sedalam 30 cm setelah hujan lebat, membahayakan pengendara roda dua.',
          category: 'ROAD_DAMAGE',
          severity: 'HIGH',
          status: 'PENDING',
          location: {
            type: 'Point',
            coordinates: [112.631784, -7.978645],
          },
          latitude: -7.978645,
          longitude: 112.631784,
          gps_accuracy_meters: 4.8,
          address_text: 'Jl. Besar Ijen, Oro-oro Dowo, Kec. Klojen, Kota Malang, Jawa Timur',
          watermarked_image_url:
            'https://storage.civicpulse.id/reports/2026/11/report-550e8400-watermarked.webp',
          image_hash_sha256:
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          captured_at: '2026-11-17T07:15:00.000Z',
          synced_from_vault: true,
          upvote_count: 0,
          created_at: '2026-11-17T07:20:00.000Z',
          idempotency_status: 'CREATED_NEW',
        },
      },
    },
  })
  createReport(
    @Body() dto: CreateReportDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const filename = file?.originalname || 'sample-watermarked.jpg';
    return {
      statusCode: 201,
      message: 'Laporan berhasil disimpan dan masuk ke antrean verifikasi.',
      data: {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        client_uuid: dto.client_uuid,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        severity: dto.severity,
        status: ReportStatus.PENDING,
        location: {
          type: 'Point',
          coordinates: [Number(dto.longitude), Number(dto.latitude)],
        },
        latitude: Number(dto.latitude),
        longitude: Number(dto.longitude),
        gps_accuracy_meters: dto.gps_accuracy_meters ?? 5.0,
        address_text:
          'Jl. Besar Ijen, Oro-oro Dowo, Kec. Klojen, Kota Malang, Jawa Timur',
        watermarked_image_url: `https://storage.civicpulse.id/uploads/${filename}`,
        image_hash_sha256:
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        captured_at: dto.captured_at,
        synced_from_vault: Boolean(dto.synced_from_vault),
        upvote_count: 0,
        created_at: new Date().toISOString(),
        idempotency_status: 'PROCESSED_SUCCESSFULLY',
      },
    };
  }

  @Get()
  @ApiOperation({
    summary:
      'Daftar laporan untuk Peta Interaktif & Pencarian Real-Time (RxJS Debounce)',
    description:
      'Menampilkan feed laporan publik terdekat di wilayah Malang. Endpoint ini dioptimalkan untuk terhubung dengan stream RxJS debounce (pencarian keyword judul) serta filter kategori, status, dan batas radius spasial peta.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Daftar laporan berdasarkan filter yang diterapkan beserta metadata spasial.',
  })
  getReports(@Query() filterDto: FilterReportsDto) {
    const mockReports = [
      {
        id: 'd4b53ef1-2131-419b-a320-13f56b0d912a',
        client_uuid: 'ca4d5a99-b1d4-4bb2-9014-a95781a8b111',
        title: 'Jalan Berlubang Dalam dan Ambles di Jl. Soekarno Hatta',
        description:
          'Lubang jalan berdiameter 1 meter dengan kedalaman 20 cm tepat di depan ruko Suhat, membahayakan pengendara motor saat malam.',
        category: ReportCategory.ROAD_DAMAGE,
        severity: SeverityLevel.HIGH,
        status: ReportStatus.VERIFIED,
        location: {
          type: 'Point',
          coordinates: [112.6189, -7.9421],
        },
        latitude: -7.9421,
        longitude: 112.6189,
        gps_accuracy_meters: 3.2,
        address_text:
          'Jl. Soekarno Hatta No. 45, Mojolangu, Kec. Lowokwaru, Kota Malang',
        watermarked_image_url:
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
        image_hash_sha256:
          'a82f3c7e9124b898124801fa8b49c71983bb519a4e019f7b18924b821948ba12',
        captured_at: '2026-11-17T06:30:00.000Z',
        synced_from_vault: true,
        upvote_count: 24,
        created_at: '2026-11-17T06:35:00.000Z',
      },
      {
        id: 'f87a31b2-c019-482a-9e12-38b812f019ab',
        client_uuid: 'ea8124b1-912a-4318-9002-c8129841bb23',
        title: 'Banjir Luapan Drainase Tersekat Sampah di Jl. Galunggung',
        description:
          'Saluran gorong-gorong tersumbat sampah ranting kayu, air meluap setinggi betis orang dewasa menutupi kedua lajur jalan.',
        category: ReportCategory.FLOOD,
        severity: SeverityLevel.CRITICAL,
        status: ReportStatus.IN_PROGRESS,
        location: {
          type: 'Point',
          coordinates: [112.6154, -7.9685],
        },
        latitude: -7.9685,
        longitude: 112.6154,
        gps_accuracy_meters: 4.0,
        address_text:
          'Jl. Galunggung, Gading Kasri, Kec. Klojen, Kota Malang',
        watermarked_image_url:
          'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800',
        image_hash_sha256:
          'c912048b819a84218901bca8192a83917823b491a082734bca8194721984bfa1',
        captured_at: '2026-11-17T06:45:00.000Z',
        synced_from_vault: false,
        upvote_count: 47,
        created_at: '2026-11-17T06:50:00.000Z',
      },
      {
        id: '2981baf1-419b-4682-8902-12481baf8921',
        client_uuid: '782b1234-a124-4f81-8012-9841bb1234aa',
        title: 'Pohon Trembesi Tumbang Menimpa Tiang Listrik di Jl. Bandung',
        description:
          'Pohon peneduh tua tumbang setelah angin kencang, kabel PLN terputus dan memicu percikan api. Akses jalan ditutup sementara.',
        category: ReportCategory.FALLEN_TREE,
        severity: SeverityLevel.CRITICAL,
        status: ReportStatus.IN_PROGRESS,
        location: {
          type: 'Point',
          coordinates: [112.6214, -7.9587],
        },
        latitude: -7.9587,
        longitude: 112.6214,
        gps_accuracy_meters: 2.8,
        address_text:
          'Jl. Bandung, Penanggungan, Kec. Klojen, Kota Malang',
        watermarked_image_url:
          'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800',
        image_hash_sha256:
          '89124ba1829f01824bba98124890cba1829471bfa891274ba91824b019842baa',
        captured_at: '2026-11-17T07:00:00.000Z',
        synced_from_vault: false,
        upvote_count: 58,
        created_at: '2026-11-17T07:05:00.000Z',
      },
      {
        id: 'a912bb81-1240-4f90-8901-b84102941faa',
        client_uuid: '612948bb-1248-4019-b001-c91824bfa182',
        title: 'Retakan Tanah Tebing DAS Kali Brantas di Muharto',
        description:
          'Tanggul tebing sungai mengalami pergeseran tanah sepanjang 15 meter, mengancam 3 rumah warga di tepi bantaran.',
        category: ReportCategory.LANDSLIDE,
        severity: SeverityLevel.HIGH,
        status: ReportStatus.PENDING,
        location: {
          type: 'Point',
          coordinates: [112.6452, -7.9945],
        },
        latitude: -7.9945,
        longitude: 112.6452,
        gps_accuracy_meters: 5.5,
        address_text:
          'Muharto Gg. 5, Kotalama, Kec. Kedungkandang, Kota Malang',
        watermarked_image_url:
          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
        image_hash_sha256:
          '5891240ba19248bb019284ca91824bfa01924bba981248ca918247019841bbfa',
        captured_at: '2026-11-17T07:10:00.000Z',
        synced_from_vault: true,
        upvote_count: 12,
        created_at: '2026-11-17T07:12:00.000Z',
      },
    ];

    return {
      statusCode: 200,
      applied_filters: {
        search: filterDto.search ?? null,
        category: filterDto.category ?? null,
        severity: filterDto.severity ?? null,
        status: filterDto.status ?? null,
        center: {
          lat: filterDto.lat ?? -7.978645,
          lng: filterDto.lng ?? 112.631784,
        },
        radius_meters: filterDto.radius_meters ?? 5000,
      },
      total: mockReports.length,
      data: mockReports,
    };
  }

  @Post(':id/upvote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crowdsourcing upvote untuk memvalidasi urgensi laporan oleh warga',
    description:
      'Warga terdekat dapat memberikan dukungan (upvote) untuk menaikkan skor prioritas perbaikan infrastruktur atau respons tanggap darurat oleh petugas dinas.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID dari laporan yang akan diberikan upvote',
    example: 'd4b53ef1-2131-419b-a320-13f56b0d912a',
  })
  @ApiResponse({
    status: 200,
    description: 'Upvote berhasil dicatat dan counter bertambah.',
  })
  upvoteReport(@Param('id', ParseUUIDPipe) id: string) {
    return {
      statusCode: 200,
      message: 'Validasi laporan berhasil ditambahkan.',
      data: {
        report_id: id,
        user_id: 'a0b1c2d3-e4f5-4a5b-8c9d-0e1f2a3b4c5d',
        user_distance_meters: 85.4,
        upvoted_at: new Date().toISOString(),
        new_total_upvotes: 25,
      },
    };
  }
}
