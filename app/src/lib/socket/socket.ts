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
    transports: [ "websocket" ]
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


/**
 * Creates a Websocket connection to /authsock Route
 * 
 * Thi
 * 
 * Returns a function to cleanup the socket
 * 
 * 
 * Usually this is used with onMount and onDestroy:
 * ```
 * let CleanAuthSock: any;
 * 
 * let jwt: string | null;
 * 
 * onMount(() => {
 *  jwt = getCookie("auth");
 *  if (jwt) {
      CleanAuthSock = onAuthSock(jwt, (authSocket: Socket) => {

        authSocket.on("connectionError", (error) => {
          // Catch the error
        });

        authSocket.emit("subscribeToSomething");

        authSocket.on("fetchSomeUpdates", (update) => {
          // Do something with the update
        });

        authSocket.on("fetchSomeErrors", (error) => {
          // Do something with the error
        });
      });
    }
  });

  onDestroy(() => {
    if (CleanAuthSock) {
      CleanAuthSock();
    }
  });
 * ```
 * @param token JWT Token
 * @param callback function to execute if the socket is connected
 * @returns cleanup function
 */
export const onAuthSock = (token: string, callback: any) => {
  const authSocket = io(import.meta.env.VITE_API_URL, { 
    path: "/api/authsock",
    query: { token },
    transports: [ "websocket" ]
  });

  if (authSocket.connected) {
    callback(authSocket);
  } else {
    authSocket.on("connect", () => callback(authSocket));
  }

  return () => {
    authSocket.off("connect");
    authSocket.disconnect();
  }
}