import mongoose, { Document, Schema, Types, Model } from 'mongoose';

export interface IReview {
  product: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

interface IReviewModel extends Model<IReviewDocument> {
  calcAverageRatings(productId: Types.ObjectId): Promise<void>;
}

const reviewSchema = new Schema<IReviewDocument, IReviewModel>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    required: true,
    index: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  images: [String],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function(productId: Types.ObjectId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('products').findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      numReviews: stats[0].nRating
    });
  } else {
    await mongoose.model('products').findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

reviewSchema.post('save', function(this: IReviewDocument) {
  (this.constructor as IReviewModel).calcAverageRatings(this.product);
});

const Review = mongoose.model<IReviewDocument, IReviewModel>('reviews', reviewSchema);
export default Review;
