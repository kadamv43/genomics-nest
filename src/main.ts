import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const allowedOrigins = [
    'http://localhost:4300',
    'http://localhost:8100',
    'https://localhost',
    'http://localhost:4200', // Localhost for development
  ];


  app.enableCors();
  await app.listen(process.env.PORT);
}
bootstrap();
