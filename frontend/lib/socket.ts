import { io, type Socket } from "socket.io-client";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";
export function createChatSocket(
  token: string,
): Socket {
  return io(API_URL, {
    autoConnect: false,
    auth: {
      token,
    },
  });
}