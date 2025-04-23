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
import { TYPE_USER } from "../../../utils/constant";

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

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      if (selectedConversation?._id !== newMessage.conversationId) return;

      newMessage.position =
        newMessage.sendBy._id === user._id ? "right" : "left";
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
    if (!selectedConversation?._id) {
      message.error("Please select a conversation!");
      return;
    }
    const data = {
      sendTo: participant?._id,
      sendBy: user._id,
      text: inputMessage,
      type: "text",
      conversationId: selectedConversation._id,
    };
    socket.emit(TYPE_SOCKET.message, {
      roomId: selectedConversation._id,
      message: data,
    });
    setInputMessage("");
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
      if (isMobile) setIsChatOpen(true);
    },
    [user._id, isMobile]
  );

  const renderMessages = useMemo(() => {
    const nameLeft = participant?.name || "Người dùng website";
    return messages.map((message) => {
      const position: string =
        message.sendBy._id === user._id ? "right" : "left";
      const isRight = position === "right";
      return {
        type: "text",
        id: message._id,
        position: position,
        text: message.text,
        title: isRight ? message.sendBy.name : nameLeft,
        focus: false,
      } as MessageType;
    });
  }, [messages, participant?.name, user._id]);

  return (
    <Card
      styles={{ body: { padding: 0, overflow: "hidden" } }}
      style={{ overflow: "hidden" }}
    >
      <Row gutter={[4, 4]}>
        {(!isMobile || !isChatOpen) && (
          <Col span={isMobile ? 24 : 6}>
            <Button
              icon={<ArrowLeftOutlined />}
              style={{
                margin: 10,
                backgroundColor: "#fff",
                color: "#000",
                borderRadius: 5,
                fontWeight: "bold",
              }}
              onClick={() => {
                if (isMobile) {
                  setIsChatOpen(true);
                } else {
                  if (user.role === TYPE_USER.admin) {
                    navigate("/admin");
                  } else if (user.role === TYPE_USER.sales) {
                    navigate("/store-manage");
                  } else navigate("/");
                }
              }}
            >
              {isMobile ? "Bắt đầu trò chuyện" : "Trở lại"}
            </Button>
            {!isMobile && <hr style={{ width: "90%" }} />}
            <ConversationListMemo
              onJoin={handleJoinConversation}
              selectedConversation={selectedConversation}
              reload={isReloadConversationList}
              userId={userId}
            />
          </Col>
        )}

        {(!isMobile || isChatOpen) && (
          <Col
            span={isMobile ? 24 : 18}
            style={{ height: "99.5vh", borderLeft: "1px solid #e5e5e5" }}
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
              {isMobile && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setIsChatOpen(false)}
                />
              )}
              <Card.Meta
                avatar={
                  <Avatar
                    src={getSourceImage(participant?.avatar || "")}
                    alt="Avatar"
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
                height: isMobile ? "calc(100vh - 140px)" : "calc(100% - 80px)",
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
        )}
      </Row>
    </Card>
  );
};

export default ChatPage;
