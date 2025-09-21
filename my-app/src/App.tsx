import React, { useState } from "react";
import Navbar from "./components/Navbar";
import URLsPage from "./pages/URLs";
import ImagesPage from "./pages/Images";
import VideosPage from "./pages/Videos";
import SocialMediaPage from "./pages/SMLinks";
import NewChat from "./pages/NewChat";

function App() {
  const [active, setActive] = useState("New Chat");
  const [chatKey, setChatKey] = useState(0);

  const reloadChat = () => setChatKey((prev) => prev + 1 )

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-white">
      <Navbar active={active} setActive={setActive} reloadChat={reloadChat}/>
      <main className="flex-1">
        {active === "New Chat" && <NewChat key={chatKey}/>}
      </main>
    </div>
  );
}

export default App;
