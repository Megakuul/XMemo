import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

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
      
      const decoded: any = jwt.verify(tok, secret);

      console.log(decoded);
      console.log(decoded._id);

    } catch (err: any) {
      socket.emit("connectionError", "Invalid token" + err.message);
      socket.disconnect(true);
      return;
    }
  });
};