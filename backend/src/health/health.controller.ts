/**
 * @file health.controller.ts
 * @description Provides an endpoint to check the overall health of the application, 
 * including MongoDB and Redis connectivity.
 */

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  /**
   * Health check endpoint.
   * @returns An object with health status of Redis and MongoDB.
   */
  @Get()
  async healthCheck(): Promise<{ redis: string; mongo: string }> {
    return this.healthService.checkDatabaseHealth();
  }
}
