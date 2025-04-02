import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CampusDocument = Campus & Document;

@Schema({
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    }
  }
})
export class Campus {
  @Prop({ required: true })
  name!: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  domain?: string;
}

export const CampusSchema = SchemaFactory.createForClass(Campus);
export const CAMPUS_MODEL = 'Campus';
