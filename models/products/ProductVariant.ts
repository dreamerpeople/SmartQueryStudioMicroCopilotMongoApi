import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductVariantOption {
  name: string;
  value: string;
}

export interface IProductVariant {
  product: Types.ObjectId;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  options: IProductVariantOption[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariantDocument extends IProductVariant, Document {}

const productVariantSchema = new Schema<IProductVariantDocument>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  compareAtPrice: Number,
  inventory: {
    type: Number,
    default: 0
  },
  options: [{
    name: String,
    value: String
  }],
  image: String
}, { timestamps: true });

const ProductVariant = mongoose.model<IProductVariantDocument>('productvariants', productVariantSchema);
export default ProductVariant;
