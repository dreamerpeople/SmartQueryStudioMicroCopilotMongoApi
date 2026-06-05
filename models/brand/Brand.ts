import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  logo: {
    url: string;
    alt?: string;
  };
  banner: {
    url: string;
    alt?: string;
  };
  website?: string;
  country?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isFeatured?: boolean;
  sortOrder?: number;
  vendorId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBrandDocument extends IBrand, Document {}

const brandSchema = new Schema<IBrandDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    logo: {
      url: { type: String, required: true },
      alt: { type: String },
    },
    banner: {
      url: { type: String, required: true },
      alt: { type: String },
    },
    website: { type: String },
    country: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    vendorId: { type: String, default: null },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: [{ type: String }],
    socialLinks: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model<IBrandDocument>('brands', brandSchema);
export default Brand;
