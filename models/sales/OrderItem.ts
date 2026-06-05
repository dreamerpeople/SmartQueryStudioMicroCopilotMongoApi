import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
  order: Types.ObjectId;
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  name?: string;
  sku?: string;
  price: number;
  quantity: number;
  totalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItemDocument extends IOrderItem, Document {}

const orderItemSchema = new Schema<IOrderItemDocument>({
  order: {
    type: Schema.Types.ObjectId,
    ref: 'orders',
    required: true,
    index: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    required: true
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'productvariants'
  },
  name: String,
  sku: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: Number
}, { timestamps: true });

const OrderItem = mongoose.model<IOrderItemDocument>('order_items', orderItemSchema);
export default OrderItem;
