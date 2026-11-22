import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  EmergencyDocument,
  GeofenceAlert,
  HazardZone,
  Report,
  ReportStatusLog,
  ReportUpvote,
  User,
} from './entities';
import { ReportsModule } from './reports/reports.module';

const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    ReportsModule,
    ...(isDatabaseConfigured
      ? [
          TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
              type: 'postgres',
              url: configService.get<string>('DATABASE_URL'),
              entities: [
                User,
                Report,
                ReportUpvote,
                ReportStatusLog,
                HazardZone,
                GeofenceAlert,
                EmergencyDocument,
              ],
              autoLoadEntities: true,
              synchronize:
                configService.get<string>('NODE_ENV') !== 'production',
            }),
          }),
        ]
      : []),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
