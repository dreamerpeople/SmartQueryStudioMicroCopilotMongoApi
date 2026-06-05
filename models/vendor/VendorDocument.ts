import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorDocument extends Document {
  vendorId: string;
  documentType: string;
  url: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const vendorDocumentSchema = new Schema<IVendorDocument>({
  _id: { type: String as any, required: true },
  vendorId: { type: String, required: true, index: true },
  documentType: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' }
}, { timestamps: true });

export default mongoose.model<IVendorDocument>('VendorDocument', vendorDocumentSchema);
