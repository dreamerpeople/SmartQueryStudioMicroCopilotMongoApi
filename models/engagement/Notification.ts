import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId | string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: String
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', notificationSchema);
