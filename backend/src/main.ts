import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, NestApplicationOptions } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
  dotenv.config();
  const logger = new Logger('Bootstrap');
  
  // Daha fazla loglama için options ekleyelim
  const options: NestApplicationOptions = {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  };

  const app = await NestFactory.create(AppModule, options);
  
  // Express middleware'i ile request loglama
  app.use((req, res, next) => {
    logger.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
  
  // Express middleware ile body parsing limiti arttırma
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
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
    enableDebugMessages: true,
  }));
  
  // Exception filter ekleyelim
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const port = process.env.BACKEND_PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
}
bootstrap();
