import { io } from "socket.io-client";
export const baseUrlSocket = "http://localhost:3000";

export const socket = io(baseUrlSocket, {
  autoConnect: false,
});

export const TYPE_SOCKET = {
  message: "message",
  notification: "notification",
};
