import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

import "./Chatroom.css";

const Chatroom = (props) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(() => props.user);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isConnected) return;

    socket.on("user-connected", (username) => {
      setComments((prev) => [
        ...prev,
        {
          type: "system",
          message: `${username} connected`,
        },
      ]);
    });

    socket.on("user-disconnected", (username) => {
      setComments((prev) => [
        ...prev,
        {
          type: "system",
          message: `${username} disconnected`,
        },
      ]);
    });

    socket.on("chat-message", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat-message");
    };
  }, [isConnected]);

  // useEffect(() => {
  //   if (!isConnected || connect) return;
  // }, connect);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConnected) return;

    const input = inputRef.current;
    const message = input.value;
    if (message) {
      socket.emit("send-message", message);

      setComments((prev) => [
        ...prev,
        {
          user,
          message,
        },
      ]);
    }
  };

  const handleConnect = () => {
    if (!user) return;
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.emit("new-user", user);
    setSocket(socket);
  };

  const handleDisconnect = () => {
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.disconnect();
  };
  console.log(new Date().toString());
  console.log(new Date().getTime());
  return (
    <>
      <form onSubmit={(e) => handleSubmit(e)}>
        {isConnected ? (
          <button type="button" onClick={() => handleDisconnect()}>
            離線
          </button>
        ) : (
          <button type="button" onClick={() => handleConnect()}>
            連接
          </button>
        )}
        <div className="chat-message-container">
          {comments.map((comment, index) =>
            comment.type === "system" ? (
              <div key={`${index}`} className="system-message">
                {comment.message}
              </div>
            ) : (
              <div key={`${index}`} className="chat-message">
                <div className="username">
                  {comment.user.username === user.username
                    ? "You"
                    : comment.user.username}
                  :
                </div>
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
    </>
  );
};

export default Chatroom;
