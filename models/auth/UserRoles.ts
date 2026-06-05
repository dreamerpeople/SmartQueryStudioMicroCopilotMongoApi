import mongoose, { Document, Schema } from 'mongoose';

export interface IUserRoles {
  CompanyID: string;
  RoleID: string;
  RoleName: string;
  RoleDescription?: string;
  IsSelfService: boolean;
  SetDate: Date;
  UserId: string;
  IsActive: boolean;
  Status: string;
  IsStatic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRolesDocument extends IUserRoles, Document {}

const userRolesSchema = new Schema<IUserRolesDocument>({
  CompanyID: {
    type: String,
    required: true,
    index: true
  },
  RoleID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  RoleName: {
    type: String,
    required: true
  },
  RoleDescription: {
    type: String
  },
  IsSelfService: {
    type: Boolean,
    default: false
  },
  SetDate: {
    type: Date,
    default: Date.now
  },
  UserId: {
    type: String,
    required: true,
    index: true
  },
  IsActive: {
    type: Boolean,
    default: true
  },
  Status: {
    type: String,
    default: 'Active'
  },
  IsStatic: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const UserRoles = mongoose.model<IUserRolesDocument>('UserRoles', userRolesSchema);
export default UserRoles;
