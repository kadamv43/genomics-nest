
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AppConfigDocument = AppConfig & Document;

@Schema()
export class AppConfig {
  @Prop({ required: true, trim: true })
  discount_limit: number;

  @Prop({ required: true, trim: true })
  invoice_generate_otp:boolean
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
