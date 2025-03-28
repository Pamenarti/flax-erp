import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    this.logger.log(`Request: ${method} ${url}`);

    return next
      .handle()
      .pipe(
        tap(data => {
          const res = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log(`Response: ${method} ${url} ${res.statusCode} - ${delay}ms`);
          this.logger.debug(`Response data: ${JSON.stringify(data).substring(0, 200)}...`);
        }),
      );
  }
}
