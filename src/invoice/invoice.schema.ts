// src/invoices/schemas/invoice.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { Appointment } from 'src/appointments/appointment.schema';
import { Doctor } from 'src/doctors/doctor.schema';
import { Patient } from 'src/patients/patients.schema';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: { createdAt: 'created_at' } })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoice_number: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  })
  appointment: Appointment;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true })
  patient: Patient;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Doctor', required: false })
  doctor: Doctor;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Invoice',
    required: false,
  })
  old_invoice: Invoice;

  @Prop({ required: true })
  total_amount: number;

  @Prop({ required: true })
  paid: number;

  @Prop({ required: true })
  balance: number;

  @Prop({ required: true })
  discount: number;

  @Prop({ required: false })
  payment_mode: string;

  @Prop({ required: true })
  received_by: string;

  @Prop({ required: false })
  file: string;

  @Prop({ required: false })
  partial_payment: number;

  @Prop({ required: false })
  balance_paid: boolean;

  @Prop({ type: Object, required: false })
  payment_mode1: { mode: string; price: number };

  @Prop({ type: Object, required: false })
  payment_mode2: { mode: string; price: number };

  @Prop([
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      type: { type: String, required: true },
    },
  ])
  particulars: { name: string; price: number; type: string }[];

  @Prop({
    type: {
      account_holder: { type: String, required: true },
      bank_name: { type: String, required: true },
      branch_name: { type: String, required: true },
      cheque_number: { type: String, required: true },
      cheque_amount: { type: String, required: true },
    },
    required: false,
  })
  cheque_details: {
    account_holder: string;
    bank_name: number;
    branch_name: string;
    cheque_number: string;
    cheque_amount: string;
  }[];

  @Prop({ default: Date.now })
  created_at: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
