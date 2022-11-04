import { useState, useRef } from "react";
import Chatroom from "./components/Chatroom/Chatroom";
import Rooms from "./components/Rooms/Rooms";
import Hls, { HlsSkip } from "hls.js";

import "./App.css";
import { useEffect } from "react";

const users = ["Sans", "Bob"];

function App() {
  const videoRef = useRef(null);
  const [isStreamOn, setIsStreamOn] = useState(false);

  useEffect(() => {
    fetch("http://192.168.64.1:3000/check-stream")
      .then((res) => res.json())
      .then((result) => setIsStreamOn(result))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!videoRef.current || !isStreamOn) return;

    if (Hls.isSupported()) {
      const video = videoRef.current;
      const hls = new Hls();
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource("http://192.168.64.2/test2/index.m3u8");
      });
    }
  }, [videoRef, isStreamOn]);

  return (
    <>
      <div className="container">
        {users.map((user, index) => (
          <Chatroom
            key={`${index}`}
            user={user}
            setIsStreamOn={setIsStreamOn}
          />
        ))}
      </div>
      <div className="video-container">
        <video controls ref={videoRef} id="video" />
      </div>
    </>
  );
}

export default App;
