import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorPayout extends Document {
  vendorId: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  transactionId?: string;
  paidAt?: Date;
}

const vendorPayoutSchema = new Schema<IVendorPayout>({
  _id: { type: String as any, required: true },
  vendorId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'Bank Transfer' },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  transactionId: String,
  paidAt: Date
}, { timestamps: true });

export default mongoose.model<IVendorPayout>('VendorPayout', vendorPayoutSchema);
