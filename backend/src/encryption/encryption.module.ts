/**
 * @file encryption.module.ts
 * @description Module for encryption functionality. Exports the EncryptionService for use in other modules.
 */

import { Module } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { ConfigModule } from '../config/config.module';
import { ChannelsGateway } from 'src/channels/channels.gateway';

@Module({
  imports: [ConfigModule],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
