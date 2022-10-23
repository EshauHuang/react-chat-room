import { useState } from "react";
import Chatroom from "./components/Chatroom";

import "./App.css";

const users = [
  {
    username: "Sans",
  },
  {
    username: "Bob",
  },
];

function App() {
  return (
    <div className="container">
      {users.map((user, index) => (
        <Chatroom key={`${index}`} user={user} />
      ))}
    </div>
  );
}

export default App;
