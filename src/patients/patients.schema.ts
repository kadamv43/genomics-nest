import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema()
export class Patient {
  @Prop({ required: true, trim: true })
  patient_number: number;

  @Prop({ required: false, trim: true })
  first_name?: string;

  @Prop({ required: false, trim: true })
  husband_name?: string;

  @Prop({ required: false, trim: true })
  last_name?: string;

  @Prop({ required: false, trim: true })
  dob: string;

  @Prop({ required: false, trim: true })
  husband_dob: string;

  @Prop({ required: false, trim: true })
  age: string;

  @Prop({ required: false, trim: true })
  gender: string;

  @Prop({ required: false, trim: true })
  blood_group: string;

  @Prop({ required: false })
  mobile: string;

  @Prop({ required: false })
  husband_mobile: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: false })
  otp: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  reference_by: string;

  @Prop({ required: false })
  medical_history: string;

  @Prop({
    type: Object,
    required: false,
    _id: false,
    properties: {
      allergies: { type: Array, trim: true },
      history: { type: Object, trim: true },
    },
  })
  medical_history_info: {
    allergies: [string];
    history: [Object];
  };

  @Prop({ required: false })
  files: [{}];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
