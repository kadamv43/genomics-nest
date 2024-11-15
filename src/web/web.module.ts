import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { PatientsService } from 'src/patients/patients.service';
import { PatientsModule } from 'src/patients/patients.module';
import { AppointmentsModule } from 'src/appointments/appointments.module';
import { AppointmentsService } from 'src/appointments/appointments.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [WebController],
  imports:[PatientsModule,AppointmentsModule,HttpModule],
  providers:[PatientsService,AppointmentsService]
})
export class WebModule {}
