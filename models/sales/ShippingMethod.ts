import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IShippingMethod extends Document {
  name: string;
  description?: string;
  baseFee: number;
  weightUnitFee: number;
  volumeUnitFee: number;
  estimatedDays?: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shippingMethodSchema = new Schema<IShippingMethod>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  baseFee: {
    type: Number,
    default: 0
  },
  weightUnitFee: {
    type: Number, // Cost per kg/lb
    default: 0
  },
  volumeUnitFee: {
    type: Number, // Cost per cubic unit
    default: 0
  },
  estimatedDays: {
    min: Number,
    max: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const ShippingMethod: Model<IShippingMethod> = mongoose.model<IShippingMethod>('ShippingMethod', shippingMethodSchema);
export default ShippingMethod;
