/**
 * @file session.middleware.ts
 * @description Intercepts incoming HTTP requests, decrypts session data from the cookie,
 * and attaches the resulting session to the request object. This implementation uses Redis as a store,
 * with encryption applied to session data for additional security.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../encryption/encryption.service';
import { ConfigService } from '../config/config.service';
import { DatabaseService } from '../database/database.service';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);
  private sessionMiddleware: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly databaseService: DatabaseService,
  ) {
    // Create a Redis client for session storage.
    const redisClient = createClient({
      url: this.configService.redisUri,
      socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 1000) },
    });

    redisClient.on('connect', () =>
      this.logger.log('✅ Redis session store connected'),
    );
    redisClient.on('error', (err) =>
      this.logger.error('❌ Redis session store error:', err),
    );
    redisClient.connect().catch((err) =>
      this.logger.error('❌ Failed to connect to Redis:', err),
    );

    // Create a RedisStore that uses the EncryptionService to secure session data.
    const store = new RedisStore({
      client: redisClient,
      prefix: 'session:',
      ttl: 86400, // 1 day in seconds
      serializer: {
        parse: (data: string) => {
          try {
            const decrypted = this.encryptionService.decrypt(data);
            return JSON.parse(decrypted);
          } catch (err) {
            this.logger.error('Failed to parse session data:', err);
            return {};
          }
        },
        stringify: (data: any) => {
          try {
            const stringified = JSON.stringify(data);
            return this.encryptionService.encrypt(stringified);
          } catch (err) {
            this.logger.error('Failed to stringify session data:', err);
            return '';
          }
        },
      },
    });

    // Initialize the express-session middleware.
    this.sessionMiddleware = session({
      store,
      secret: this.configService.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: this.configService.cookieSecure,
        sameSite: this.configService.cookieSameSite,
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      },
    });
  }

  /**
   * Executes the session middleware to attach the session to the request.
   * Ensures that _parsedUrl exists to avoid errors with certain Express versions.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Next middleware function.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Ensure req.url is defined
    if (!req.url) {
      req.url = '/';
    }
    // Safely assign _parsedUrl if not already defined (needed by some Express setups)
    if (!(req as any)._parsedUrl) {
      (req as any)._parsedUrl = { pathname: req.url };
    }
    this.sessionMiddleware(req, res, next);
  }
}
