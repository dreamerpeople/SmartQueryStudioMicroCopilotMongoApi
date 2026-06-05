import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorWallet extends Document {
  vendorId: string;
  balance: number;
  currency: string;
  status: string;
}

const vendorWalletSchema = new Schema<IVendorWallet>({
  _id: { type: String as any, required: true },
  vendorId: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'BDT' },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model<IVendorWallet>('VendorWallet', vendorWalletSchema);
