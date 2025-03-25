import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button, Card, Flex, Space, Tooltip, Typography, Avatar } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { DebounceSelect } from "./DebounceSelect";
import { Conversation } from "../../type/conversation.type";
import { RootState } from "../../redux/store";
import { User } from "../../type/user.type";
import { FORMAT_FULL_TIME, formatedDate } from "../../utils/handle_format_func";
import { getSourceImage } from "../../utils/handle_image_func";
import { TYPE_USER, TYPE_USER_STR } from "../../utils/constant";
import { getUsers } from "../../api/user.api";
import {
  createConversation,
  getConversationsByUserId,
} from "../../api/conversation.api";

interface ConversationListMemoProps {
  onJoin: (conversation: Conversation, isNew?: boolean) => void;
  reload: boolean;
  selectedConversation?: Conversation;
}

interface OptionType {
  value: string;
  label: string;
}

const ConversationListMemo: React.FC<ConversationListMemoProps> = ({
  onJoin,
  reload,
}) => {
  const [userSearch, setUserSearch] = useState<OptionType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [isReloadConversation, setIsReloadConversation] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (!user?._id) return;
      const data = await getConversationsByUserId(user._id);
      setConversations(data);
      if (data.length > 0) {
        onJoin(data[0]);
      }
    };

    initData();
  }, [user?._id, isReloadConversation, onJoin, reload]);

  const handleSelected = async (selected: string) => {
    console.log("oke");
    console.log(selected);
    if (!selected) return;
    const participantId = selected;
    const existConversation = conversations.find((item) =>
      item.participants.some((participant) => participant._id === participantId)
    );

    if (existConversation) {
      onJoin(existConversation);
    } else {
      console.log("ok");

      const conversation = await createConversation({
        participants: [participantId, user._id],
      });
      console.log(conversation);
      onJoin(conversation, true);
      setIsReloadConversation((prev) => !prev);
    }
  };
  const fetchUserList = useCallback(
    async (searchKey = "") => {
      try {
        const result = await getUsers({
          searchKey,
          limit: 10,
          roles: [
            TYPE_USER.admin,
            TYPE_USER.user,
            TYPE_USER.shipper,
            TYPE_USER.sales,
          ],
        });

        return result.users
          .filter((item: User) => item._id !== user._id)
          .map((item: User) => ({
            label: `${TYPE_USER_STR[item.role || ""]} | ${
              item.name || "Chưa xác định"
            } - ${item.phone || "Trống"}`,
            value: item._id,
          }));
      } catch (error) {
        console.error("Error fetching user list:", error);
        return [];
      }
    },
    [user]
  );

  const renderTimeChatMessage = (date: string) => {
    const now = dayjs();
    const dateMessage = dayjs(date);
    const diff = now.diff(dateMessage, "minute");

    if (diff === 0) return `${now.diff(dateMessage, "second")} giây trước`;
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 24 * 60) return `${Math.floor(diff / 60)} giờ trước`;
    if (diff < 7 * 24 * 60) return `${Math.floor(diff / (24 * 60))} ngày trước`;
    return formatedDate(date, FORMAT_FULL_TIME);
  };

  return (
    <div style={{ paddingLeft: 10, width: "100%", minWidth: 270 }}>
      <Space
        direction="vertical"
        style={{ paddingRight: 18, width: "100%", marginTop: 10 }}
      >
        <Flex align="center" justify="space-between">
          <Typography.Title level={5} style={{ marginBottom: 0 }}>
            Danh sách tin nhắn
          </Typography.Title>
          <Tooltip title="Làm mới">
            <Button
              type="text"
              onClick={() => setIsReloadConversation((prev) => !prev)}
              icon={<ReloadOutlined />}
            />
          </Tooltip>
        </Flex>
        <DebounceSelect
          allowClear
          selectId="patientId"
          placeholder="Nhắn tin cho shop..."
          fetchOptions={fetchUserList}
          onChange={(selected) => setUserSearch(selected ?? null)}
          onSelected={handleSelected}
          style={{ width: "100%" }}
          refreshData={!!user?._id}
          value={userSearch || undefined}
        />
      </Space>
      {conversations.length === 0 && (
        <Flex justify="center" style={{ padding: 10 }}>
          <Typography.Text type="secondary">
            Không có tin nhắn nào
          </Typography.Text>
        </Flex>
      )}
      <Flex
        vertical
        gap={10}
        style={{ height: "70vh", overflowY: "auto", paddingRight: 10 }}
      >
        {conversations.map((conversation) => {
          const participant =
            conversation.participants.find((item) => item._id !== user._id) ||
            ({} as User);
          return (
            <Card
              key={conversation._id}
              style={{ cursor: "pointer", width: "100%" }}
              hoverable
              onClick={() => onJoin(conversation)}
            >
              <Flex gap={10} align="center">
                <Avatar
                  style={{ width: 40, height: 40 }}
                  src={getSourceImage(participant.avatar || "")}
                  alt="User"
                />
                <Flex vertical gap={5}>
                  <Typography.Text>
                    {participant.name || "Chưa xác định"}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {participant.phone}
                  </Typography.Text>
                </Flex>
                <Typography.Text
                  type="secondary"
                  style={{
                    position: "absolute",
                    right: 10,
                    bottom: 10,
                    fontSize: 14,
                  }}
                >
                  {renderTimeChatMessage(conversation.updatedAt.toString())}
                </Typography.Text>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </div>
  );
};

export default ConversationListMemo;
