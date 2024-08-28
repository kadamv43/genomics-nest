import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { PdfService } from './services/pdf/pdf.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EmailModule } from './email/email.module';
import { FileUploadService } from './services/file-upload/file-upload/file-upload.service';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest'),
    AuthModule,
    AppointmentsModule,
    UsersModule,
    ProductsModule,
    DoctorsModule,
    PatientsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/assets'), // Path to your static assets directory
      serveRoot: '/assets', // The base URL path to serve the assets
    }),
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService, PdfService, FileUploadService],
})
export class AppModule {}
