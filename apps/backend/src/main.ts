import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting backend...');
  console.log('PORT:', process.env.PORT || 3001);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for frontend
  const corsOrigins =
    frontendUrl && frontendUrl.trim() !== ''
      ? frontendUrl.split(',').map((url) => url.trim())
      : true;

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get<string>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend is running on http://0.0.0.0:${port}`);
  if (frontendUrl) {
    console.log(`CORS enabled for: ${frontendUrl}`);
  }
}
bootstrap();
