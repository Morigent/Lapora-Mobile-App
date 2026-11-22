import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { HazardZonesController } from './hazard-zones.controller';

@Module({
  controllers: [ReportsController, HazardZonesController],
  exports: [],
})
export class ReportsModule {}

