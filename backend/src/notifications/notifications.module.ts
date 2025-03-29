import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { ConfigModule } from '../config/config.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [ConfigModule, SessionModule],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
