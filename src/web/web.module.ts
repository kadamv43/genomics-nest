import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { PatientsService } from 'src/patients/patients.service';
import { PatientsModule } from 'src/patients/patients.module';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { OtpModule } from 'src/otp/otp.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { InvoiceService } from 'src/invoice/invoice.service';

@Module({
  controllers: [WebController],
  imports:[PatientsModule,AppointmentsModule,OtpModule,InvoiceModule],
  providers:[PatientsService,AppointmentsService]
})
export class WebModule {}
