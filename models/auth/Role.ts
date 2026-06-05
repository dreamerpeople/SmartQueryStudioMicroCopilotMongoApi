import mongoose, { Document, Schema } from 'mongoose';

export interface IRole {
  name: 'admin' | 'vendor' | 'customer' | 'guest';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleDocument extends IRole, Document {}

const roleSchema = new Schema<IRoleDocument>({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'vendor', 'customer', 'guest'],
  },
  permissions: [{
    type: String,
    trim: true
  }]
}, { timestamps: true, collection: 'roles' });

const Role = mongoose.model<IRoleDocument>('Roles', roleSchema);
export default Role;
