/**
 * Emit a message to a List of sockets
 * @param subscriberList List of sockets
 * @param stream Stream to send message
 * @param content Content of the message
 */
export const emitSeveral = async (subscriberList, stream, content) => {
    subscriberList.forEach((socket) => {
        socket.emit(stream, content);
    });
};
/**
 * Removes all sockets that are disconnected from the list
 *
 * Example:
 * ```javascript
 * const list1 = [socket1, socket2];
 * const list2 = [socket3, socket5];
 *
 * removeDisconnectedSockets(
 *   [
 *     list1,
 *     list2
 *   ], 1000 * 60
 * );
 * ```
 * @param list List of Socketlists to check
 * @param intervall Intervall to check the Sockets
 */
export const removeDisconnectedSockets = (list, intervall) => {
    setInterval(() => {
        list.forEach((socketlist) => {
            socketlist.forEach((socket, index) => {
                if (socket.disconnected) {
                    socketlist.splice(index, 1);
                }
            });
        });
    }, intervall);
};
