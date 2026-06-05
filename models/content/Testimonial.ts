import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITestimonial extends Document {
  user?: mongoose.Types.ObjectId;
  name?: string;
  content: string;
  rating?: number;
  status: 'pending' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  name: String,
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' }
}, { timestamps: true });

const Testimonial: Model<ITestimonial> = mongoose.model<ITestimonial>('testimonials', testimonialSchema);
export default Testimonial;
