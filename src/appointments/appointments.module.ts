import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorsModule } from 'src/doctors/doctors.module';
import { ProductsModule } from 'src/products/products.module';
import { PdfService } from 'src/services/pdf/pdf.service';
import { DoctorsService } from 'src/doctors/doctors.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileUploadService } from 'src/services/file-upload/file-upload/file-upload.service';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    PatientsModule,
    DoctorsModule,
    ProductsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: '../uploads/',
        filename: (req, file, callback) => {
          const filename = `${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    PdfService,
    DoctorsService,
    FileUploadService,
  ],
})
export class AppointmentsModule {}
