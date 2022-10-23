import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const users = {};

const comments = {
  length: 0,
};

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("new-user", (user) => {
    users[socket.id] = {
      user,
      comments: {
        length: 0,
      },
    };

    socket.broadcast.emit("user-connected", user.username);
  });

  socket.on("send-message", (message) => {
    socket.broadcast.emit("chat-message", {
      user: users[socket.id].user,
      message,
    });

    const index = users[socket.id].comments.length;
    users[socket.id].comments = {
      ...users[socket.id].comments,
      [index]: {
        message,
      },
      length: index + 1,
    };
    const newComment = buildNewComment(users[socket.id].user, message);
    console.log(newComment);
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    socket.broadcast.emit("user-disconnected", users[socket.id].user.username);
    delete users[socket.id];
  });
});

httpServer.listen(3000, () => {
  console.log("listening on *:3000");
});

function buildNewComment(user, message) {
  return {
    user,
    message,
  };
}
