import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, NestApplicationOptions } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');
  
  // Debug amaçlı daha fazla log
  const options: NestApplicationOptions = {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  };

  const app = await NestFactory.create(AppModule, options);
  
  // Debug amaçlı Express request loggeri
  app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  
  // JSON için boyut limitini arttır
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  // CORS ayarları - tüm kaynaklara izin ver (geliştirme amaçlı)
  app.enableCors({
    origin: '*', // Geliştirme için her kaynağa izin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  });
  
  // Validasyon ve interceptor'ları ekle
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    enableDebugMessages: true,
  }));
  
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Önemli: Global prefix'i kaldıralım veya doğru ayarlayalım
  // app.setGlobalPrefix('api'); // Eğer API'lerinizi /api ile başlatmak istiyorsanız, bu satırı aktif edin

  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
}
bootstrap();
