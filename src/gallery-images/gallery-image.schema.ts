
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export type GalleryImageDocument = GalleryImage & Document;

@Schema()
export class GalleryImage {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Gallery', required: true })
  gallery: string;

  @Prop({ required: true, trim: true })
  image: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const GalleryImageSchema = SchemaFactory.createForClass(GalleryImage);
