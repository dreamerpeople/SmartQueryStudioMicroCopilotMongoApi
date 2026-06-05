import mongoose, { Document, Schema } from 'mongoose';

export interface IRolePermission {
  role_permission_id: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRolePermissionDocument extends IRolePermission, Document {}

const rolePermissionSchema = new Schema<IRolePermissionDocument>(
  {
    role_permission_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    permissions: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true, collection: "role_permissions" },
);

const RolePermission = mongoose.model<IRolePermissionDocument>('RolePermissions', rolePermissionSchema);
export default RolePermission;
