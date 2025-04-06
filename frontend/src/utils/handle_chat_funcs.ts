import { Conversation, Participant } from "../type/conversation.type";
import { getChatsByConversationId } from "../api/chat.api";
import { socket } from "./socket";
import { Chat } from "../type/chat.type";

export const handleJoinConversation = async (
  conversation: Conversation,
  isNew: boolean = false,
  userId: string,
  setInputMessage: (msg: string) => void,
  setSelectedConversation: (conv: Conversation) => void,
  setParticipant: (participant?: Participant) => void,
  setMessages: (messages: Chat[]) => void
) => {
  if (isNew) {
    socket.emit("newConversation", conversation);
  }

  setInputMessage("");
  setSelectedConversation(conversation);

  const participant = conversation.participants.find(
    (item) => item._id !== userId
  );
  setParticipant(participant);

  const chats = await getChatsByConversationId(conversation._id);
  setMessages(chats);
};
