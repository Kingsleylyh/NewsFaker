import React from "react";
import { MessageCirclePlus} from "lucide-react";

type NavbarProps = {
  active: string;
  setActive: (page: string) => void;
  reloadChat: () => void
};

const Navbar: React.FC<NavbarProps> = ({ active, setActive , reloadChat}) => {
  const items = [
    { name: "New Chat", icon: <MessageCirclePlus size={20} /> }
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#111827] shadow-md">
      {/* Left Section with logo */
        <div className="flex item-left gap-8 ">
          {/* Logo */}
          <img
            src="/Logo.png"
            alt="Logo"
            className="h-10 w-auto cursor-pointer hover:scale-105 transition-transform"
            onClick={() => { setActive("New Chat"); reloadChat(); }}
          />
        </div>
      }

      {/* Right Section with Nav items */}
      <div className="flex items-right gap-8">
        {/* Nav items */}
        <div className="flex items-center gap-6">
          {items.map((item) => (
            <button
              key={item.name}
              onClick={() => {setActive(item.name); if(item.name === "New Chat") reloadChat();}}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-grey-400 hover:bg-primary hover:text-black"
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
