import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on http://0.0.0.0:${port}`);
}
bootstrap();
