import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './patients.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
    HttpModule,
  ],
  providers: [PatientsService],
  controllers: [PatientsController],
  exports: [MongooseModule, PatientsService],
})
export class PatientsModule {}
