import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true,
    index: true
  },
  guestId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true
    },
    variant: {
      type: Schema.Types.ObjectId,
      ref: 'productvariants'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, { timestamps: true });

// TTL Index for Guest Carts
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Cart: Model<ICart> = mongoose.model<ICart>('carts', cartSchema);
export default Cart;
