import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDetailDocument = ContactDetail & Document;

@Schema()
export class ContactDetail {
  @Prop({ required: false, trim: true })
  mobile_numbers: [string];

  @Prop({ required: false, trim: true })
  address: string;

  @Prop({ required: false, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: false, trim: true })
  facebook_link: string;

  @Prop({ required: false, trim: true })
  youtube_link: string;

  @Prop({ required: false, trim: true })
  instagram_link: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const ContactDetailSchema = SchemaFactory.createForClass(ContactDetail);
