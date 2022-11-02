import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import "./Chatroom.css";

const Chatroom = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => user);
  const inputRef = useRef(null);
  const roomRef = useRef(null);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (!chatMessagesRef || !comments.length) return;

    const chatMEssageEl = chatMessagesRef.current;

    chatMEssageEl.lastChild.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [comments, chatMessagesRef]);

  useEffect(() => {
    const socket = io("http://localhost:3000", { autoConnect: false });

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socket);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("new-user");
      socket.off("user-left");
      socket.off("chat-message");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("new-user", (user) => {
      setComments((prev) => [
        ...prev,
        {
          type: "system",
          message: `${user} connected`,
        },
      ]);
    });

    socket.on("user-left", (user) => {
      setComments((prev) => [
        ...prev,
        {
          type: "system",
          message: `${user} disconnected`,
        },
      ]);
    });

    socket.on("chat-message", ({ user, message }) => {
      setComments((prev) => [
        ...prev,
        {
          user,
          message,
        },
      ]);
    });
    return () => {
      socket.off("new-user");
      socket.off("user-left");
      socket.off("chat-message");
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const input = inputRef.current;
    if (!input || !input.value) return;
    const message = input.value;
    socket.emit("send-message", message, (response) => {
      if (response.status === "ok") {
        setComments((prev) => [
          ...prev,
          {
            user: "You",
            message,
          },
        ]);
      }
    });
    input.value = "";
  };

  const handleConnectSocket = () => {
    const room = roomRef.current;
    if (!room) return;

    socket.connect();
    socket.emit("join-room", {
      user: currentUser,
      room: room.value,
    });
  };

  const handleDisconnectSocket = () => {
    if (!isConnected) return;
    socket.disconnect();
  };

  const handleStreamClose = () => {
    socket.emit("stream-close");
  }

  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)}>
        {isConnected ? (
          <button type="button" onClick={() => handleDisconnectSocket()}>
            離線
          </button>
        ) : (
          <button type="button" onClick={() => handleConnectSocket()}>
            連接
          </button>
        )}
        <select ref={roomRef}>
          <option value="room1">聊天室1</option>
          <option value="room2">聊天室2</option>
          <option value="room3">聊天室3</option>
        </select>
        <div className="chat-message-container" ref={chatMessagesRef}>
          {comments.map((comment, index) =>
            comment.type === "system" ? (
              <div key={`${index}`} className="system-message">
                {comment.message}
              </div>
            ) : (
              <div key={`${index}`} className="chat-message">
                <div className="username">{comment.user}:</div>
                <div className="message">{comment.message}</div>
              </div>
            )
          )}
        </div>
        <div className="input-container">
          <input type="text" ref={inputRef} />
          <button type="submit">送出</button>
        </div>
      </form>
      <button onClick={handleStreamClose}>直播結束</button>
    </>
  );
};

export default Chatroom;
