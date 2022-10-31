import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

class Comments {
  constructor() {
    this.length = 0;
  }
  addComment(user, text) {
    if (!user || !text) return
    this[this.length] = {
      user,
      text,
    };
    this.length++;
  }
}

class Users {
  constructor() {
    this.length = 0;
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
    this.length++
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
}

const rooms = new Rooms();
const users = new Users();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", ({ user, room }) => {
    socket.join(room);

    currentRoomToDo(() => {
      socket.to(room).emit("new-user", user);
    });

    rooms.addUserToRoom(room, socket.id, user);

    users.addUser(socket.id, user);
    console.log(users, rooms);
  });

  socket.on("send-message", (message, callback) => {
    const { user } = users[socket.id];

    currentRoomToDo((room) => {
      socket.to(room).emit("chat-message", {
        user,
        message,
      });

      rooms.addCommentToRoom(room, message, user);

      if (!callback) return;
      callback({
        status: "ok",
      });
    });

    console.log(users, rooms);
  });

  socket.on("disconnecting", function () {
    const { user } = users[socket.id];

    currentRoomToDo((room) => {
      socket.to(room).emit("user-left", user);
      rooms.removeUserFromRoom(room, socket.id);
    });

    users.removeUser(socket.id);
    console.log(users, rooms);
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
