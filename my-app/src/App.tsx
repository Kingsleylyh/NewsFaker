import React, { useState } from "react";
import Navbar from "./components/Navbar";
import URLsPage from "./pages/URLs";
import ImagesPage from "./pages/Images";
import VideosPage from "./pages/Videos";
import SocialMediaPage from "./pages/SMLinks";
import NewChat from "./pages/NewChat";

function App() {
  const [active, setActive] = useState("Home");

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-white">
      <Navbar active={active} setActive={setActive} />
      <main className="flex-1 p-6">
        {active === "New Chat" && <NewChat />}
        {/* {active === "URLs" && <URLsPage />}
        {active === "Images" && <ImagesPage />}
        {active === "Videos" && <VideosPage />}
        {active === "Social Media Links" && <SocialMediaPage />} */}
      </main>
    </div>
  );
}

export default App;
