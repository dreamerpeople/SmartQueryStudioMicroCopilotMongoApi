import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrder {
  user: Types.ObjectId;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount: number;
  currency: string;
  customer: Types.ObjectId;
  shippingAddress: Types.ObjectId;
  billingAddress: Types.ObjectId;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  isGift: boolean;
  orderDate: Date;
  statusHistory?: {
    fromStatus: string;
    toStatus: string;
    updatedBy: string;
    timestamp: Date;
    notes?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const orderSchema = new Schema<IOrderDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  taxAmount: Number,
  shippingAmount: Number,
  discountAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customers',
    required: true
  },
  shippingAddress: {
    type: Schema.Types.ObjectId,
    ref: 'addresses',
    required: true
  },
  billingAddress: {
    type: Schema.Types.ObjectId,
    ref: 'addresses',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: String,
  shippingMethod: {
    type: Schema.Types.ObjectId,
    ref: 'ShippingMethod'
  },
  trackingNumber: String,
  notes: String,
  isGift: {
    type: Boolean,
    default: false
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  statusHistory: [{
    fromStatus: String,
    toStatus: String,
    updatedBy: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, { timestamps: true });

orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model<IOrderDocument>('orders', orderSchema);
export default Order;
