import { useState, useRef } from "react";
import Chatroom from "./components/Chatroom/Chatroom";
import Rooms from "./components/Rooms/Rooms";
import Hls, { HlsSkip } from "hls.js";

import "./App.css";
import { useEffect } from "react";

const users = ["Sans", "Bob"];

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const video = videoRef.current;
      const hls = new Hls();
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log("video and hls.js are now bound together !");

        try {
          hls.loadSource("http://192.168.64.2/test2/index.m3u8")
        } catch (error) {
          console.log("error", error);
        }
      });
    }
  }, [videoRef]);

  return (
    <>
      <div className="container">
        {users.map((user, index) => (
          <Chatroom key={`${index}`} user={user} />
        ))}
      </div>
      <div className="video-container">
        <video controls ref={videoRef} id="video" />
      </div>
    </>
  );
}

export default App;
