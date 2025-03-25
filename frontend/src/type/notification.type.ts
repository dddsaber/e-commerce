export interface Notification {
  _id: string;
  userId: string;
  createdBy: string;
  title: string;
  message: string;
  linkTo: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
