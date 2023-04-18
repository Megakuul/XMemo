import { io, type Socket } from "socket.io-client";

export let socket: Socket;

export const onConnected = (callback: any) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, { path: "/gamesock" });
  }
  if (socket.connected) {
    callback();
  } else {
    socket.on("connect", callback);
  }
}