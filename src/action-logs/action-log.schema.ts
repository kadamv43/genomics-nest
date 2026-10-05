import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ActionLogDocument = ActionLog & Document;

export interface ActionLogChange {
  field: string;
  old: any;
  new: any;
}

@Schema({ collection: 'actionlogs' })
export class ActionLog {
  @Prop({ index: true })
  user_id: string;

  @Prop()
  user_name: string;

  @Prop()
  user_email: string;

  @Prop({ index: true })
  user_role: string;

  @Prop({ required: true, index: true })
  module: string;

  // CREATE | UPDATE | DELETE | LOGIN | LOGIN_FAILED
  @Prop({ required: true, index: true })
  action: string;

  @Prop()
  method: string;

  @Prop()
  path: string;

  @Prop()
  entity_id: string;

  @Prop()
  entity_label: string;

  @Prop()
  summary: string;

  @Prop({ type: [Object], default: [] })
  changes: ActionLogChange[];

  @Prop()
  status_code: number;

  @Prop()
  ip: string;

  @Prop()
  user_agent: string;

  @Prop({ default: Date.now, index: true })
  created_at: Date;
}

export const ActionLogSchema = SchemaFactory.createForClass(ActionLog);
