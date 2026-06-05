import mongoose, { Document, Schema } from 'mongoose';

export interface IImageVariant {
  key: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface IUploadedImage extends Document {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  storageProvider: 'local' | 's3' | 'cloudinary';
  url: string;
  secure_url?: string;
  variants: IImageVariant[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const imageVariantSchema = new Schema<IImageVariant>({
  key: String,
  url: String,
  width: Number,
  height: Number,
  format: String,
  size: Number
}, { _id: false });

const uploadedImageSchema = new Schema<IUploadedImage>({
  filename: { type: String, required: true, unique: true },
  originalName: String,
  mimetype: String,
  size: Number,
  width: Number,
  height: Number,
  storageProvider: {
    type: String,
    enum: ['local', 's3', 'cloudinary'],
    default: 'local'
  },
  url: { type: String, required: true },
  secure_url: String,
  variants: [imageVariantSchema],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IUploadedImage>('UploadedImage', uploadedImageSchema);
