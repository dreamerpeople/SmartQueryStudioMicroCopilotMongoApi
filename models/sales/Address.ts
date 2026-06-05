import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['shipping', 'billing'],
    default: 'shipping'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  fullName: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: String,
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: String
}, { timestamps: true });

const Address: Model<IAddress> = mongoose.model<IAddress>('addresses', addressSchema);
export default Address;
