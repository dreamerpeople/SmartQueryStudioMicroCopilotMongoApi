import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorTransaction extends Document {
  vendorId: string;
  orderId?: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  status: string;
}

const vendorTransactionSchema = new Schema<IVendorTransaction>({
  _id: { type: String as any, required: true },
  vendorId: { type: String, required: true, index: true },
  orderId: String,
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  description: String,
  status: { type: String, default: 'Completed' }
}, { timestamps: true });

export default mongoose.model<IVendorTransaction>('VendorTransaction', vendorTransactionSchema);
