import jwt from "jsonwebtoken";
export const setupAuthSocket = async (io, secret) => {
    io.on("connection", async (socket) => {
        const token = socket.handshake.query?.token;
        if (!token) {
            socket.emit("connectionError", "No token provided");
            socket.disconnect(true);
            return;
        }
        else if (!secret) {
            socket.emit("connectionError", "Server cannot find JWT Secret, contact an Administrator");
            socket.disconnect(true);
            return;
        }
        try {
            let [bearer, tok] = token.toString().split(" ");
            if (bearer !== "Bearer") {
                tok = token.toString();
            }
            console.log(tok);
            const decoded = jwt.verify(tok, secret);
            console.log(decoded);
            console.log(decoded._id);
        }
        catch (err) {
            socket.emit("connectionError", "Invalid token" + err.message);
            socket.disconnect(true);
            return;
        }
    });
};
