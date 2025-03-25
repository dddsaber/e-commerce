interface UserDetail {
  _id: string;
  name: string;
  avatar: string;
}
export interface Chat {
  _id: string;
  text: string;
  file?: string;
  sendTo: UserDetail;
  sendBy: UserDetail;
  conversationId: string;
  position: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
