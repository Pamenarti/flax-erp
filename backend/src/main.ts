import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS ayarları
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://88.218.130.67:3000',
      'http://88.218.130.67'
    ],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validasyon pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger dokümantasyonu
  const config = new DocumentBuilder()
    .setTitle('Flax-ERP API')
    .setDescription('Flax-ERP sistemi için API dokümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Server başlatma
  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`Flax-ERP API başlatıldı: http://${host}:${port}/api`);
  console.log(`Swagger Dokümantasyonu: http://${host}:${port}/api/docs`);
}
bootstrap();
