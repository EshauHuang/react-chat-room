import { useState } from "react";
import Chatroom from "./components/Chatroom/Chatroom";
import Rooms from "./components/Rooms/Rooms";

import "./App.css";

const users = ["Sans", "Bob"];

function App() {
  return (
    <div className="container">
      {users.map((user, index) => (
        <Chatroom key={`${index}`} user={user} />
      ))}
    </div>
    // <Rooms />
  );
}

export default App;
