import { instance } from ".";
import { Chat } from "../type/chat.type";

const baseURL = "/chat";

export const getChatsByConversationId = async (
  conversationId: string
): Promise<Chat[]> => {
  const response = await instance.post<Chat[]>(`${baseURL}/list`, {
    conversationId,
  });
  return response.data;
};

export const createChat = async (data: Chat) => {
  const response = await instance.post<Chat>(`${baseURL}/create`, data);
  return response;
};
