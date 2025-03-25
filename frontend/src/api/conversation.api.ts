import { instance } from ".";
import { Conversation } from "../type/conversation.type";

const baseURL = "/conversation";

export const getConversationsByUserId = async (
  userId: string
): Promise<Conversation[]> => {
  const response = await instance.post<Conversation[]>(`${baseURL}/list`, {
    userId,
  });
  return response.data;
};

export const getConversationInstance = async (conversationId: string) => {
  const response = await instance.get<Conversation>(
    `${baseURL}/${conversationId}`
  );
  return response.data;
};

export const createConversation = async (data: {
  name?: string;
  participants: string[];
  lastMessage?: string;
}): Promise<Conversation> => {
  const response = await instance.post<Conversation>(`${baseURL}/create`, data);
  return response.data;
};
