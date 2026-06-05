import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category?: string;
  tags: string[];
  image?: string;
  status: 'draft' | 'published';
  views: number;
  seo: {
    title?: string;
    description?: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  category: String,
  tags: [String],
  image: String,
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  views: { type: Number, default: 0 },
  seo: { 
    title: String, 
    description: String, 
    keywords: [String] 
  }
}, { timestamps: true });

const Blog: Model<IBlog> = mongoose.model<IBlog>('blogs', blogSchema);
export default Blog;
