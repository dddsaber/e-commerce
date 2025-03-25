export interface Participant {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  avatar: string;
}

export interface Conversation {
  _id: string;
  name?: string;
  participants: Participant[];
  lastMessage?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
