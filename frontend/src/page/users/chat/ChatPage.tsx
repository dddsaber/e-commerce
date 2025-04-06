import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Conversation, Participant } from "../../../type/conversation.type";
import { Chat } from "../../../type/chat.type";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { socket, TYPE_SOCKET } from "../../../utils/socket";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Input,
  message,
  Row,
  Space,
} from "antd";
import { getChatsByConversationId } from "../../../api/chat.api";
import { getSourceImage } from "../../../utils/handle_image_func";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { SpaceDiv } from "../../../components/chat/SpaceDiv";
import { MessageList, MessageType } from "react-chat-elements";
import ConversationListMemo from "../../../components/chat/ConversationListMemo";
import { useLocation, useNavigate } from "react-router-dom";

const ChatPage: React.FC = () => {
  const location = useLocation();
  const userId = location.state?.userId || null;
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation>();
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<Chat[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [participant, setParticipant] = useState<Participant>();
  const [isReloadConversationList, setIsReloadConversationList] =
    useState<boolean>(false);
  const refChat = useRef(null);

  useEffect(() => {
    socket.connect();

    function onConnect() {
      setIsConnected(true);
      console.log("Connected to the server");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("Disconnected from the server");
    }

    function onMessage(newMessage: Chat) {
      console.log(newMessage);
      const { sendBy } = newMessage;
      if (selectedConversation?._id !== newMessage.conversationId) {
        return;
      }

      newMessage.position = sendBy._id === user._id ? "right" : "left";
      console.log(newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }

    function newConversation(conversation: {
      name?: string;
      participants: string[];
      lastMessage?: string;
    }) {
      if (conversation.participants.includes(user._id)) {
        setIsReloadConversationList((prev) => !prev);
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);
    socket.on("newConversation", newConversation);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
      socket.off("newConversation", newConversation);
    };
  }, [selectedConversation?._id, user._id]);

  useEffect(() => {
    if (selectedConversation?._id) {
      socket.emit("joinRoom", selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const containerChat = document.querySelector(
      ".message-list-custom .rce-mlist"
    );

    const timeOut = setTimeout(() => {
      containerChat?.scrollTo({
        top: containerChat.scrollHeight,
        behavior: "smooth",
      });
    }, 100);

    return () => clearTimeout(timeOut);
  }, [messages]);

  const handleSendMessage = () => {
    try {
      if (!selectedConversation?._id) {
        message.error("Please select a conversation!");
        return;
      }
      const data = {
        sendTo: participant?._id,
        sendBy: user._id,
        text: inputMessage,
        type: "text",
        conversationId: selectedConversation?._id,
      };

      socket.emit(TYPE_SOCKET.message, {
        roomId: selectedConversation._id,
        message: data,
      });
      setInputMessage("");
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  const handleJoinConversation = useCallback(
    async (conversation: Conversation, isNew = false) => {
      if (isNew) {
        socket.emit("newConversation", conversation);
      }
      setInputMessage("");
      setSelectedConversation(conversation);

      setParticipant(
        conversation.participants.find((item) => item._id !== user._id)
      );

      const chats = await getChatsByConversationId(conversation._id);
      setMessages(chats);
    },
    [user._id]
  );

  const renderMessages = useMemo(() => {
    const photoLeft = getSourceImage(participant?.avatar || "");
    const nameLeft = participant?.name || "Người dùng website";

    return messages.map((message) => {
      const { sendBy } = message;
      const position: string = sendBy._id === user._id ? "right" : "left";

      const isRight = position === "right";
      console.log(isRight);
      return {
        type: "text",
        id: message._id,
        position: position,
        text: message.text,
        title: isRight ? sendBy.name : nameLeft,
        focus: false,
        date: new Date(message.updatedAt),
        avatar: isRight ? undefined : photoLeft,
      } as MessageType;
    });
  }, [messages, participant?.name, participant?.avatar, user._id]);

  return (
    <Card
      styles={{ body: { padding: 0, overflow: "hidden" } }}
      style={{
        overflow: "hidden",
      }}
    >
      <Row gutter={[4, 4]}>
        <Col span={6} style={{}}>
          <Button
            icon={<ArrowLeftOutlined />}
            style={{
              marginLeft: 10,
              backgroundColor: "#fff",
              color: "#000",
              borderRadius: 5,
              fontWeight: "bold",
              border: "none",
            }}
            onClick={() => navigate("/")}
          >
            Trở lại
          </Button>
          <hr style={{ width: "90%" }} />
          <ConversationListMemo
            onJoin={handleJoinConversation}
            selectedConversation={selectedConversation}
            reload={isReloadConversationList}
            userId={userId}
          />
        </Col>
        <Col
          span={18}
          style={{
            borderLeft: "1px solid #f2f2f2",
            height: "100vh",
            backgroundColor: "#f4f4f4",
            padding: 0,
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{
              padding: 10,
              background: "#fff",
              height: 70,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <Card.Meta
              avatar={
                <Avatar
                  src={getSourceImage(participant?.avatar || "")}
                  alt="Reactjs"
                />
              }
              title={participant?.name || "Chưa xác định"}
            />
          </Flex>
          <SpaceDiv height={10} />
          <Flex
            vertical
            justify="space-between"
            style={{
              height: "calc(100% - 80px)",
              minWidth: 350,
            }}
          >
            <MessageList
              className="message-list message-list-custom"
              lockable={true}
              toBottomHeight={"100%"}
              dataSource={renderMessages}
              referance={refChat}
            />
            <Space.Compact style={{ width: "100%", padding: 10 }}>
              <Input
                size="large"
                placeholder="Nhập tin nhắn..."
                value={inputMessage}
                onPressEnter={handleSendMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                defaultValue="Combine input and button"
              />
              <Button
                size="large"
                type="primary"
                onClick={handleSendMessage}
                icon={<SendOutlined />}
              >
                Gửi
              </Button>
            </Space.Compact>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};

export default ChatPage;
