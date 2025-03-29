/**
 * @file database.module.ts
 * @description Global module for managing database connections. It provides MongoDB (via Mongoose)
 * and Redis connectivity. Exports the Redis client and DatabaseService.
 */

import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { mongoProvider, redisProvider } from './database.providers';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mongoProvider.useFactory,
    }),
  ],
  providers: [redisProvider, DatabaseService],
  exports: [redisProvider, MongooseModule, DatabaseService],
})
export class DatabaseModule {}
