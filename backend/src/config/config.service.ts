/**
 * @file config.service.ts
 * @description Provides strongly typed access to environment variables.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly nestConfigService: NestConfigService) {}

  private getRequiredEnv(key: string): string {
    const value = this.nestConfigService.get<string>(key);
    if (!value) {
      this.logger.error(`Missing required environment variable: ${key}`);
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV') || 'development';
  }

  get port(): number {
    const port = this.nestConfigService.get<number>('PORT');
    if (!port) {
      this.logger.error('Missing required environment variable: PORT');
      throw new Error('Missing required environment variable: PORT');
    }
    return port;
  }

  get apiPrefix(): string {
    return this.nestConfigService.get<string>('API_PREFIX') || 'api';
  }

  get corsOrigin(): string {
    return this.nestConfigService.get<string>('CORS_ORIGIN') || '*';
  }

  // Build the Mongo URI from individual variables.
  get mongoUri(): string {
    const host = this.getRequiredEnv('MONGO_HOST');
    const port = this.getRequiredEnv('MONGO_PORT');
    const db = this.getRequiredEnv('MONGO_DB');
    return `mongodb://${host}:${port}/${db}`;
  }

  // Build the Redis URI from individual variables.
  get redisUri(): string {
    const host = this.getRequiredEnv('REDIS_HOST');
    const port = this.getRequiredEnv('REDIS_PORT');
    return `redis://${host}:${port}`;
  }

  get sessionSecret(): string {
    return this.getRequiredEnv('SESSION_SECRET');
  }

  get encryptionKey(): string {
    return this.getRequiredEnv('ENCRYPTION_KEY');
  }

  get cookieSecure(): boolean {
    return this.nestConfigService.get<boolean>('COOKIE_SECURE') || false;
  }

  get cookieSameSite(): 'lax' | 'strict' | 'none' {
    return this.nestConfigService.get<string>('COOKIE_SAME_SITE') as 'lax' | 'strict' | 'none' || 'strict';
  }
}
