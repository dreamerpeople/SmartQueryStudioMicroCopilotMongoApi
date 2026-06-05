import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICustomer extends Document {
  customerId: string;
  userId: Types.ObjectId;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  postcode?: string;
  marketingOptIn: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      unique: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true
    },
    title: {
      type: String,
      enum: ['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Other'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    postcode: {
      type: String,
      trim: true
    },
    marketingOptIn: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Customer = mongoose.model<ICustomer>('customers', customerSchema);
export default Customer;
