import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

const FAQ: Model<IFAQ> = mongoose.model<IFAQ>('faqs', faqSchema);
export default FAQ;
