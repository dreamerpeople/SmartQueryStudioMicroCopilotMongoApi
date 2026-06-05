import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContentPage extends Document {
  title: string;
  slug: string;
  content: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const contentPageSchema = new Schema<IContentPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

const ContentPage: Model<IContentPage> = mongoose.model<IContentPage>('contentpages', contentPageSchema);
export default ContentPage;
