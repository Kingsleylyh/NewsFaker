import React from "react";
import { Home, Link, Image, Video, Share2, User } from "lucide-react";

type NavbarProps = {
  active: string;
  setActive: (page: string) => void;
};

const Navbar: React.FC<NavbarProps> = ({ active, setActive }) => {
  const items = [
    { name: "Home", icon: <Home size={20} /> },
    { name: "URLs", icon: <Link size={20} /> },
    { name: "Images", icon: <Image size={20} /> },
    { name: "Videos", icon: <Video size={20} /> },
    { name: "Social Media Links", icon: <Share2 size={20} /> },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#111827] shadow-md">
      {/* Left Section with logo + nav items */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <img
          src="/Logo.png"
          alt="Logo"
          className="h-10 w-auto cursor-pointer hover:scale-105 transition-transform"
          onClick={() => setActive("Home")}
        />

        {/* Nav items */}
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                active === item.name
                  ? "bg-primary text-black font-bold shadow-lg"
                  : "text-gray-400 hover:text-primary"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
