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
    'http://localhost:4200', // Localhost for development
  ];


  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests with no origin (like mobile apps or CURL requests)
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        // Origin is allowed
        return callback(null, true);
      } else {
        // Origin is not allowed
        return callback(new Error('Not allowed by CORS'));
      }
    }, // Replace with your allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept,Authorization,enctype',
    // credentials: true, // if you need to handle cookies
  });
  await app.listen(process.env.PORT);
}
bootstrap();
