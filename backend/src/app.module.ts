import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { EncryptionModule } from './encryption/encryption.module';
import { SessionModule } from './session/session.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    EncryptionModule,
    SessionModule,
    HealthModule,
    UsersModule,
    AuthModule,
    FriendsModule,
    NotificationsModule,
    ChannelsModule,
  ],
})
export class AppModule {}
