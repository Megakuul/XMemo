import { io, type Socket } from "socket.io-client";

export let pubSocket: Socket;
export let authSocket: Socket;

export const onPubSock = (callback: any) => {
  if (!pubSocket) {
    pubSocket = io(import.meta.env.VITE_API_URL, { path: "/publicsock" });
  }
  if (pubSocket.connected) {
    callback();
  } else {
    pubSocket.on("connect", callback);
  }
}

export const onAuthSock = (token: string, callback: any) => {
  if (!authSocket) {
    authSocket = io(import.meta.env.VITE_API_URL, { 
      path: "/authsock",
      query: { token }
    });
  }
  if (authSocket.connected) {
    callback();
  } else {
    authSocket.on("connect", callback);
  }
}