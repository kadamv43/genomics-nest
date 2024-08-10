import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DoctorDocument = Doctor & Document;

@Schema()
export class Doctor {
  @Prop({ required: true, trim: true })
  user_id: string;

  @Prop({ required: true, trim: true })
  first_name: string;

  @Prop({ required: true, trim: true })
  last_name: string;

  @Prop({ required: false, trim: true })
  specialization: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({
    type: Object,
    required: false,
    _id: false,
    properties: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
    },
  })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };

  @Prop({ min: 0 })
  years_of_experience: number;

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
