import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as hbs from 'hbs';
import { format } from 'date-fns';


import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'templates'));
  app.setViewEngine('hbs');

  hbs.registerHelper('incrementIndex', function (index) {
    return index + 1;
  });

  hbs.registerHelper('formatDate', (date: Date, formatString: string) => {
    return format(new Date(date), formatString);
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res, path, stat) => {
      res.set('Access-Control-Allow-Origin', '*'); // Allow all origins
    },
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
