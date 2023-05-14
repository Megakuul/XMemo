import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { handleCurrentGameUpdate } from "./AuthSocket.handler.js";

/**
 * Initializes the Public Socket
 * 
 * This Socket can be accessed by everyone, it is not authenticating the user
 * 
 * To use a authenticated session, use the AuthSocket 
 * 
 * 
 * Sideeffects:
 * This function will use the provided io (Server) object to send and receive messages
 * @param io Websocket Server
 * @param secret JWT Secret from the server
 */
export const setupAuthSocket = async (io: Server, secret: string | undefined) => {
  io.on("connection", async (socket: Socket) => {
    const token = socket.handshake.query?.token;

    if (!token) {
      socket.emit("connectionError", "No token provided");
      socket.disconnect(true);
      return;
    } else if (!secret) {
      socket.emit("connectionError", "Server cannot find JWT Secret, contact an Administrator");
      socket.disconnect(true);
      return;
    }

    try {
      let [bearer, tok] = token.toString().split(" ");
      if (bearer !== "Bearer") {
        tok = token.toString();
      }
      
      const decodedToken: any = jwt.verify(tok, secret);

      socket.on("subscribeCurrentGames", () => {
        handleCurrentGameUpdate(socket, decodedToken.id, 
          "currentGamesUpdate", 
          "currentGamesUpdateError", 
          "unsubscribeCurrentGames"
        );
      });

      socket.once("disconnect", () => {
        socket.removeAllListeners("subscribeCurrentGames");
      });

    } catch (err: any) {
      socket.emit("connectionError", "Invalid token" + err.message);
      socket.disconnect(true);
      return;
    }
  });
};