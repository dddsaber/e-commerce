export interface Notification {
  _id: string;
  userId: string;
  createdBy: string;
  image?: string;
  title: string;
  target: string;
  targetModel: string;
  message: string;
  linkTo?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
