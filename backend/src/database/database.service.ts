/**
 * @file database.service.ts
 * @description Provides helper methods for checking the health of database connections
 * and exposing the Redis client and MongoDB connection.
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { RedisClientType } from 'redis';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('REDIS_CLIENT') public readonly redisClient: RedisClientType,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Pings the Redis server.
   * @returns A promise that resolves with the Redis ping response.
   */
  async pingRedis(): Promise<string> {
    try {
      const reply = await this.redisClient.ping();
      this.logger.log(`Redis PONG: ${reply}`);
      return reply;
    } catch (err) {
      this.logger.error('Redis Error:', err);
      throw err;
    }
  }

  /**
   * Checks the health of the MongoDB connection.
   * @throws An error if the MongoDB connection is not ready.
   */
  async mongoHealthCheck(): Promise<void> {
    const readyState = this.connection.readyState;
    this.logger.log(`MongoDB connection state: ${readyState}`);
    if (readyState !== 1) {
      const errorMessage = 'MongoDB is not connected';
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
}
