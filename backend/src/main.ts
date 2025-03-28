import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  
  // CORS ayarları
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Validasyon pipe'ı
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Exception filter ekleyelim
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global prefix kaldırıldı, frontend'in /api ile istek yapması bekleniyor
  
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
}
bootstrap();
