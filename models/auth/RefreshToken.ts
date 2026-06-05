import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRefreshToken {
  user: Types.ObjectId;
  token: string;
  expires: Date;
  revoked?: Date;
  replacedByToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {
  isExpired: boolean;
  isActive: boolean;
}

const refreshTokenSchema = new Schema<IRefreshTokenDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expires: {
    type: Date,
    required: true
  },
  revoked: Date,
  replacedByToken: String
}, { timestamps: true });

refreshTokenSchema.virtual('isExpired').get(function (this: IRefreshTokenDocument) {
  return Date.now() >= this.expires.getTime();
});

refreshTokenSchema.virtual('isActive').get(function (this: IRefreshTokenDocument) {
  return !this.revoked && !this.isExpired;
});

const RefreshToken = mongoose.model<IRefreshTokenDocument>('refreshtokens', refreshTokenSchema);
export default RefreshToken;
