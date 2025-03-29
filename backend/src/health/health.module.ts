/**
 * @file health.module.ts
 * @description Health module that encapsulates health checking functionality.
 */

import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [HealthService],
  controllers: [HealthController],
})
export class HealthModule { }
