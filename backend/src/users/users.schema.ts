import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CAMPUS_MODEL } from '../campus/schemas/campus.schema';

export interface ICampus {
    id: string;
    name: string;
}

export interface IUser {
    _id?: string;
    email: string;
    username: string;
    password: string;
    campus: string | ICampus | Types.ObjectId;
    friendRequests?: string[];
    sentFriendRequests?: string[];
    friends?: string[];
    blockedUsers?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    major?: string;
    fullName?: string;
}


export type UserDocument = User & Document;

@Schema({
    timestamps: true,
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
export class User implements IUser {
    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true, unique: true })
    username!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ type: Types.ObjectId, ref: CAMPUS_MODEL, required: true })
    campus!: string | ICampus;

    @Prop({ type: [String], default: [] })
    friendRequests!: string[];

    @Prop({ type: [String], default: [] })
    sentFriendRequests!: string[];

    @Prop({ type: [String], default: [] })
    friends!: string[];

    @Prop({ type: [String], default: [] })
    blockedUsers!: string[];

    @Prop({ required: false, default: "Student" })
    major?: string;

    @Prop({ type: String, required: false })
    fullName?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
