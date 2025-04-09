/**
 * @file main.ts
 * @description Application entry point. Bootstraps the NestJS application using the
 * new modular architecture. Global settings such as API prefix and CORS are configured
 * using values from the ConfigService.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SessionMiddleware } from './session/session.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Set global API prefix.
  app.setGlobalPrefix(configService.apiPrefix);

  // Apply global exception filter.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS with secure configuration.
  app.enableCors({
    origin: `http://${configService.corsOrigin}`,
    credentials: true,
  });

  // Retrieve and apply global logger middleware.
  app.use(new LoggerMiddleware().use);

  // Start the server.
  await app.listen(configService.port);
  logger.log(`🚀 Server running on http://localhost:${configService.port}`);
}

bootstrap();
