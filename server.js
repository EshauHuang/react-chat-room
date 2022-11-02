import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as fs from "fs";

class Comments {
  constructor() {
    this.length = 0;
    this.createTime = Date.now();
  }
  addComment(user, text) {
    if (!user || !text) return;
    this[this.length] = {
      user,
      text,
      time: new Date().getTime(),
    };
    this.length++;
  }
  showComments() {
    return this;
  }
}

class Users {
  constructor() {
    this.length = 0;
    this.createTime = Date.now();
  }
  addUser(socketId, user) {
    if (!socketId || !user) return;
    this[socketId] = { user };
    this.length++;
  }
  removeUser(socketId) {
    if (!socketId || !this[socketId]) return;
    delete this[socketId];
    this.length--;
  }
}

class Rooms {
  constructor() {
    this.length = 0;
  }
  addRoom(room) {
    if (this[room]) return;
    this[room] = {
      users: new Users(),
      comments: new Comments(),
    };
    this.length++;
  }
  addUserToRoom(room, socketId, user) {
    if (!room || !socketId || !user) return;
    this.addRoom(room);
    this[room].users.addUser(socketId, user);
  }
  removeUserFromRoom(room, socketId) {
    if (!room || !socketId) return;
    this[room].users.removeUser(socketId);
  }
  addCommentToRoom(room, message, user) {
    if (!room || !message || user) {
      this.addRoom(room);
      this[room].comments.addComment(message, user);
    }
  }
  showRoomComments(room) {
    return this[room].comments.showComments();
  }
}

const rooms = new Rooms();
const users = new Users();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.io = io;

app.get("/rtmp/on_publish", (req, res) => {
  console.log("GET/on_publish");
  res.send("success");
});

app.get("/rtmp/on_publish_done", (req, res) => {
  console.log("GET/on_publish_done");
  res.send("success");
});

app.post("/rtmp/on_publish", (req, res) => {
  console.log(req.app.io, req.body);
  console.log("POST/on_publish");
  res.send("success");
});

app.post("/rtmp/on_publish_done", (req, res) => {
  console.log(req);
  console.log("POST/on_publish_done");
  res.send("success");
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ user, room }) => {
    socket.join(room);

    currentRoomToDo((room) => {
      socket.to(room).emit("new-user", user);
    });

    rooms.addUserToRoom(room, socket.id, user);

    users.addUser(socket.id, user);
  });

  socket.on("send-message", (message, callback) => {
    const { user } = users[socket.id];

    currentRoomToDo((room) => {
      socket.to(room).emit("chat-message", {
        user,
        message,
      });

      rooms.addCommentToRoom(room, user, message);
      console.log(rooms.showRoomComments(room));

      if (!callback) return;
      callback({
        status: "ok",
      });
    });
  });

  socket.on("disconnecting", function () {
    const { user } = users[socket.id];

    currentRoomToDo((room) => {
      socket.to(room).emit("user-left", user);
      rooms.removeUserFromRoom(room, socket.id);
    });

    users.removeUser(socket.id);
  });

  // 假設直播結束
  socket.on("stream-close", async () => {
    const json = JSON.stringify({
      room1: {
        comments: rooms["room1"].comments,
      },
    });
    await fs.promises.writeFile("comments.json", json);
  });

  function currentRoomToDo(func) {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        func(room);
      }
    }
  }
});

server.listen(3000, () => {
  console.log("Server is on 3000 port");
});
