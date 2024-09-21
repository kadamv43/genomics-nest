
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export type GalleryDocument = Gallery & Document;

@Schema()
export class Gallery {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const GallerySchema = SchemaFactory.createForClass(Gallery);
