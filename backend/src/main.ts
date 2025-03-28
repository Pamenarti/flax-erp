import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS yapılandırması
  app.enableCors({
    origin: ['http://localhost:3000', 'https://flax-erp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  
  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // API prefix
  app.setGlobalPrefix('api');
  
  // Swagger API dokümanı
  const config = new DocumentBuilder()
    .setTitle('Flax-ERP API')
    .setDescription('Flax-ERP API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3001);
  console.log(`Uygulama http://localhost:3001 adresinde çalışıyor`);
  console.log(`API Dokümantasyonu: http://localhost:3001/api/docs`);
}
bootstrap();
