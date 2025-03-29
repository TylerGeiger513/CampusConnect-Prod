/**
 * @file logger.middleware.ts
 * @description A functional and modular HTTP logging middleware. This middleware
 * logs incoming HTTP requests and their response status/duration using the AppLogger.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLogger } from '../../core/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Logs details of the incoming request and its response.
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @param next - The next middleware function.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Attach a listener to the 'finish' event on the response.
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const message = `${method} ${originalUrl} ${res.statusCode} - ${duration}ms`;
      AppLogger.log(message);
    });

    next();
  }
}
