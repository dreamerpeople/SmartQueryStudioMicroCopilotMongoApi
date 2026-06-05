import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserRole {
  user: Types.ObjectId;
  role: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRoleDocument extends IUserRole, Document {}

const userRoleSchema = new Schema<IUserRoleDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Roles', // Reference the collection name if needed, but model name is IRole
    required: true,
    index: true
  }
}, { timestamps: true });

userRoleSchema.index({ user: 1, role: 1 }, { unique: true });

const UserRole = mongoose.model<IUserRoleDocument>('UserRole', userRoleSchema);
export default UserRole;
