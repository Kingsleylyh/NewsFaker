// NewChat.tsx
import React, { useState } from "react";
import { ArrowUp, Link, Image, ScanText, Share2 } from "lucide-react";

type ChatInputWithItemsProps = {
  onSend?: (text: string, active: string) => Promise<void> | void;
  initialActive?: string;
};

const items = [
  { name: "URLs", icon: <Link size={16} /> },
  { name: "Media", icon: <Image size={16} /> },
  { name: "Text", icon: <ScanText size={16} /> },
  { name: "X", icon: <Share2 size={16} /> },
];

const NewChat: React.FC<ChatInputWithItemsProps> = ({
  onSend,
  initialActive = "URLs",
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [active, setActive] = useState(initialActive);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend?.(text.trim(), active);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      // optionally clear: setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen darkBg flex flex-col items-center justify-start py-20 px-4">
      <h1 className="mb-8 text-4xl text-primary/95 font-semibold">What can I help with?</h1>

      {/* Chat container */}
      <div className="w-full max-w-4xl">
        <div className="bg-[#111827] rounded-3xl shadow-lg p-4">
          <div className="flex items-stretch gap-4">
            {/* Middle : textarea (styled like ChatGPT input, large rounded) */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={4}
              placeholder="Paste an article, headline, or URL here. Press Enter to send (Shift+Enter for newline)."
              className="flex-1 resize-none bg-transparent border-0 text-white placeholder-gray-400 px-4 py-4 rounded-2xl focus:outline-none focus:ring-0"
              aria-label="Message input"
            />

            {/* Right: circular send button */}
            <div className="flex items-center pr-3">
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-md hover:scale-[1.03] transition-transform disabled:opacity-50"
                aria-label="Send"
              >
                <ArrowUp size={20} className="primary text-black font-bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Items row BELOW the chat box */}
        <div className="mt-4 flex justify-center">
          <div className="flex flex-wrap gap-3 items-center">
            {items.map((it) => (
              <button
                key={it.name}
                onClick={() => setActive(it.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm ${
                  active === it.name
                    ? "bg-primary text-black font-medium"
                    : "text-gray-300 hover:bg-white/5"
                }`}
                aria-pressed={active === it.name}
              >
                <span className="opacity-90">{it.icon}</span>
                <span className="whitespace-nowrap">{it.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;