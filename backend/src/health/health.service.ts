/**
 * @file health.service.ts
 * @description Provides health check functionality for external dependencies like MongoDB and Redis.
 */

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly databaseService: DatabaseService) { }

  /**
   * Checks the health of the database connections.
   * @returns An object with the status of Redis and MongoDB.
   */
  async checkDatabaseHealth(): Promise<{ redis: string; mongo: string }> {
    const redis = await this.databaseService.pingRedis();
    await this.databaseService.mongoHealthCheck();
    return { redis, mongo: 'healthy' };
  }
}
