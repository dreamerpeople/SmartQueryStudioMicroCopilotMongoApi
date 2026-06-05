import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductImage {
  original: string;
  large: string;
  medium: string;
  small: string;
  thumbnail: string;
  alt?: string;
  isMain?: boolean;
  [key: string]: any;
}

export interface IProductVideo {
  url: string;
  provider?: string;
  title?: string;
}

export interface IProductAttribute {
  name: string;
  value: string;
}

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProductSEO {
  title?: string;
  description?: string;
  slug?: string;
  keywords?: string[];
}

export interface IProduct {
  productId: string;
  sku?: string;
  slug?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  vendorId: string;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId;
  stockQuantity: number;
  trackQuantity: boolean;
  continueSellingWhenOutOfStock: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: IProductImage[];
  videos: IProductVideo[];
  attributes: IProductAttribute[];
  specifications: IProductSpecification[];
  tags: string[];
  reviews: Types.ObjectId[];
  variants: any[];
  vendor?: Types.ObjectId;
  status: "draft" | "active" | "archived" | "out_of_stock" | "pending";
  visibility: "visible" | "hidden";
  seo: IProductSEO;
  warranty?: {
    type?: string;
    duration?: string;
    policy?: string;
  };
  isFeatured: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

const productSchema = new Schema<IProductDocument>(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: "text",
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      index: "text",
    },
    shortDescription: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    costPrice: {
      type: Number,
      min: 0,
    },
    vendorId: {
      type: String,
      required: [true, "Vendor ID is required"],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'categories',
      required: [true, "Category ID is required"],
      index: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'categories',
      index: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      default: 0,
    },
    trackQuantity: {
      type: Boolean,
      default: true,
    },
    continueSellingWhenOutOfStock: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      default: 0,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    images: [Schema.Types.Mixed],
    videos: [
      {
        url: String,
        provider: String,
        title: String,
      },
    ],
    attributes: [
      {
        name: String,
        value: String,
      },
    ],
    specifications: [
      {
        label: String,
        value: String,
      },
    ],
    tags: [String],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "reviews",
      },
    ],
    variants: [Schema.Types.Mixed],
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "out_of_stock", "pending"],
      default: "active",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
    },
    seo: {
      title: String,
      description: String,
      slug: { type: String, index: true },
      keywords: [String],
    },
    warranty: {
      type: { type: String },
      duration: String,
      policy: String,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model<IProductDocument>("products", productSchema);
export default Product;
