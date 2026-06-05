import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorCommission extends Document {
  vendorId: string;
  type: 'PERCENTAGE' | 'FIXED';
  rate: number;
  status: string;
}

const vendorCommissionSchema = new Schema<IVendorCommission>({
  _id: { type: String as any, required: true },
  vendorId: { type: String, required: true, index: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' },
  rate: { type: Number, default: 10 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model<IVendorCommission>('VendorCommission', vendorCommissionSchema);
