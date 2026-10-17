import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // Log the error securely without sensitive data
<<<<<<< HEAD
    console.error(`[Error] ${request.method} ${request.url} - Status: ${status}`);
=======
    console.error(`[Error] ${request.method} ${request.url} - Status: ${status}`, exception);
>>>>>>> origin/feat/setup-nestjs-postgres-prisma-16265149769609236843

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' && message !== null && 'message' in message ? (message as any).message : message,
    });
  }
}
