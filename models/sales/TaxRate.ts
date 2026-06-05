import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITaxRate extends Document {
  country: string;
  state: string;
  rate: number;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taxRateSchema = new Schema<ITaxRate>({
  country: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    default: 'All',
    index: true
  },
  rate: {
    type: Number,
    required: true, // Percentage e.g. 15 for 15%
    min: 0
  },
  name: String, // e.g. VAT, GST, Sales Tax
}, { timestamps: true });

taxRateSchema.index({ country: 1, state: 1 }, { unique: true });

const TaxRate: Model<ITaxRate> = mongoose.model<ITaxRate>('taxrates', taxRateSchema);
export default TaxRate;
