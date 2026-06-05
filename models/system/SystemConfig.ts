import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemConfig extends Document {
  siteName: string;
  siteEmail: string;
  isDiscountApprovalRequired: boolean;
  maintenanceMode: boolean;
  currency: string;
}

const systemConfigSchema = new Schema<ISystemConfig>({
  _id: { type: String as any, required: true },
  siteName: { type: String, default: 'E-commerce Store' },
  siteEmail: String,
  isDiscountApprovalRequired: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
  currency: { type: String, default: 'BDT' }
}, { timestamps: true });

export default mongoose.model<ISystemConfig>('SystemConfig', systemConfigSchema);
