import { io, type Socket } from "socket.io-client";

/**
 * Creates a Websocket connection to /publicsock Route
 * 
 * Returns a function to cleanup the socket
 * 
 * 
 * Usually this is used with onMount and onDestroy:
 * ```
 * let CleanPubSock: any;
 * 
 * onMount(() => {
    CleanPubSock = onPubSock((pubSocket: Socket) => {
      pubSocket.emit("subscribeToSomething");

      pubSocket.on("fetchSomeUpdates", (update) => {
        // Do something with the update
      });

      pubSocket.on("fetchSomeErrors", (error) => {
        // Do something with the error
      })
    });
  });

  onDestroy(() => {
    if (CleanPubSock) {
      CleanPubSock();
    }
  });
 * ```
 * @param callback function to execute if the socket is connected
 * @returns cleanup function
 */
export const onPubSock = (callback: any) => {
  const pubSocket: Socket = io(import.meta.env.VITE_API_URL, {
    path: "/api/publicsock",
    transports: [ "websocket" ],
    secure: !import.meta.env.VITE_DISABLE_SOCKET_TLS
  });
  if (pubSocket.connected) {
    callback(pubSocket);
  } else {
    pubSocket.on("connect", () => callback(pubSocket));
  }

  return () => {
    pubSocket.off("connect");
    pubSocket.disconnect();
  }
}