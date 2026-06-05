import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission {
  permission_id: string;
  module: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermissionDocument extends IPermission, Document {}

const permissionSchema = new Schema<IPermissionDocument>({
  permission_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  module: {
    type: String,
    required: true,
    index: true
  },
  label: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'permissions' });

const Permission = mongoose.model<IPermissionDocument>('Permission', permissionSchema);
export default Permission;
