import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema()
export class Otp {
  @Prop({ required: true, trim: true })
  mobile: string;

  @Prop({ required: false, trim: true })
  otp: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
