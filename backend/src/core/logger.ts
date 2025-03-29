/**
 * @file logger.ts
 * @description Provides a simple functional logging utility that wraps NestJS Logger
 * for use in pure functions or modules that require a logging interface.
 */

import { Logger } from '@nestjs/common';

export class AppLogger {
  private static logger = new Logger('AppLogger');

  /**
   * Logs a debug message.
   * @param message - The message to log.
   */
  static debug(message: string): void {
    this.logger.debug(message);
  }

  /**
   * Logs an informational message.
   * @param message - The message to log.
   */
  static log(message: string): void {
    this.logger.log(message);
  }

  /**
   * Logs an error message.
   * @param message - The error message.
   * @param trace - Optional stack trace.
   */
  static error(message: string, trace?: string): void {
    this.logger.error(message, trace);
  }
}
