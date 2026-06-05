import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory {
  name: string;
  slug?: string;
  description?: string;
  parentCategoryId?: string | null;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryDocument extends ICategory, Document {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
    },
    parentCategoryId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

categorySchema.index({ parentCategoryId: 1 });

const Category = mongoose.model<ICategoryDocument>('categories', categorySchema);
export default Category;
