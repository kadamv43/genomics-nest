import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Doctor } from 'src/doctors/doctor.schema';
import { Invoice } from 'src/invoice/invoice.schema';
import { Patient } from 'src/patients/patients.schema';
import { Product } from 'src/products/product.schema';


export type AppointmentDocument = Appointment & Document;

@Schema()
export class Appointment {
  @Prop({ required: true, trim: true })
  appointment_number: string;

  @Prop({ required: false, trim: true })
  patient_id: string;

  @Prop({ required: false, trim: true })
  doctor_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: false })
  doctor: Doctor;

  @Prop({ required: true })
  appointment_date: string;

  @Prop({ required: true })
  appointment_time: string;

  @Prop({ required: false })
  files: [{}];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }] })
  services: Product[];

  @Prop({ required: false })
  reason: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Invoice', required: false })
  invoice: Invoice;

  @Prop({ required: true, trim: true, default: 'Created' })
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
