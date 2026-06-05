import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInventory {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  reserved: number;
  sku?: string;
  location?: string;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInventoryDocument extends IInventory, Document {}

const inventorySchema = new Schema<IInventoryDocument>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    required: true,
    index: true
  },
  variant: {
    type: Schema.Types.ObjectId,
    ref: 'productvariants',
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  reserved: {
    type: Number,
    default: 0
  },
  sku: String,
  location: String,
  lowStockThreshold: {
    type: Number,
    default: 5
  }
}, { timestamps: true });

const Inventory = mongoose.model<IInventoryDocument>('inventories', inventorySchema);
export default Inventory;
