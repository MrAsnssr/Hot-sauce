import mongoose, { Schema, Document } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  nameAr: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    description: String,
    color: String,
    icon: String,
  },
  { timestamps: true }
);

export default mongoose.model<ISubject>('Subject', SubjectSchema);

