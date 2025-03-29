/**
 * @file http-exception.filter.ts
 * @description Global exception filter that captures all HTTP exceptions and logs them using AppLogger.
 * This filter sends a uniform error response to the client while logging critical details.
 */

import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { AppLogger } from '../../core/logger';
  
  @Catch()
  export class HttpExceptionFilter implements ExceptionFilter {
    /**
     * Catches exceptions and formats an error response.
     * @param exception - The thrown exception.
     * @param host - The execution context.
     */
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      // Prevent multiple responses.
      if (response.headersSent) {
        return;
      }
  
      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const errorResponse =
        exception instanceof HttpException
          ? exception.getResponse()
          : 'Internal server error';
  
      // Log the error in a functional style.
      AppLogger.error(
        `${request.method} ${request.url} - ${JSON.stringify(errorResponse)}`
      );
  
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: errorResponse,
      });
    }
  }
  