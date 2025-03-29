/**
 * @file session.module.ts
 * @description The SessionModule bundles session-related functionality including the SessionMiddleware
 * and SessionService, enabling pluggable session strategies.
 */

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionMiddleware } from './session.middleware';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [ConfigModule, DatabaseModule, EncryptionModule],
  providers: [SessionService, SessionMiddleware],
  exports: [SessionService],
})
export class SessionModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the session middleware to all routes.
    consumer
      .apply(SessionMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
