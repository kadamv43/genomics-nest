// blog.schema.ts
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export type BlogDocument = Blog & Document;

@Schema()
export class Blog {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  image: string;

  @Prop({ required: true, trim: true })
  status: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
