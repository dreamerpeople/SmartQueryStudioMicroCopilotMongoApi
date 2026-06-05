import mongoose, { Document, Schema } from 'mongoose';

export interface IVendorApplication extends Document {
  userId: string;
  applicationType: 'INDIVIDUAL' | 'BUSINESS';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stage: string;
  store: {
    storeName: string;
    slug: string;
    description?: string;
    logo?: string;
    banner?: string;
  };
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  business?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    taxId?: string;
    establishedYear?: number;
  };
  address: {
    country: string;
    division: string;
    district: string;
    area: string;
    postalCode: string;
    fullAddress: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    routingNumber?: string;
  };
  documents: Array<{
    type: string;
    url: string;
    status: string;
  }>;
  review?: {
    reviewedBy?: string;
    reviewedAt?: Date;
    remarks?: string;
  };
}

const vendorApplicationSchema = new Schema<IVendorApplication>({
  _id: { type: String as any, required: true },
  userId: { type: String, required: true, index: true },
  applicationType: { type: String, enum: ['INDIVIDUAL', 'BUSINESS'], required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  stage: { type: String, default: 'SUBMITTED' },
  store: {
    storeName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    logo: String,
    banner: String
  },
  owner: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  business: {
    businessName: String,
    businessType: String,
    registrationNumber: String,
    taxId: String,
    establishedYear: Number
  },
  address: {
    country: { type: String, required: true },
    division: { type: String, required: true },
    district: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: { type: String, required: true },
    fullAddress: { type: String, required: true }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchName: String,
    routingNumber: String
  },
  documents: [{
    type: String,
    url: String,
    status: { type: String, default: 'PENDING' }
  }],
  review: {
    reviewedBy: String,
    reviewedAt: Date,
    remarks: String
  }
}, { timestamps: true });

export default mongoose.model<IVendorApplication>('VendorApplication', vendorApplicationSchema);
