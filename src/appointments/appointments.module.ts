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


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    PatientsModule,
    DoctorsModule,
    ProductsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PdfService,DoctorsService],
})
export class AppointmentsModule {}
