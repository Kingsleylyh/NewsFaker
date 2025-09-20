import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Link, Image, ScanText, Share2 } from "lucide-react";

type ChatInputWithItemsProps = {
  onSend?: (text: string, active: string) => Promise<string | void> | string | void;
  initialActive?: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
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
  const [messages, setMessages] = useState<Message[]>([]);

  // Ref for text-area
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset height
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        10 * 24 // 👈 about 10 lines (24px line-height each)
      )}px`;
    }
  }, [text]);

  // Ref for auto-scrolling
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);

    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const maybeReply = await onSend?.(text.trim(), active);
      const replyMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text:
          typeof maybeReply === "string"
            ? maybeReply
            : `Got it! You sent: "${text.trim()}" (category: ${active})`,
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 darkBg flex flex-col">
      {/* Chat content area */}
      <div className="flex-1 overflow-y-auto px-4 py-20 flex flex-col items-center">
        {messages.length === 0 && (
          <h1 className="mb-8 text-4xl text-primary/95 font-semibold">
            What can I help with?
          </h1>
        )}

        <div className="w-full max-w-4xl space-y-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}

          {/* Invisible div that acts as scroll target */}
          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Input fixed at bottom */}
      <div className="sticky bottom-0 bg-[#0a0f1f] w-full">
        <div className="w-full max-w-4xl mx-auto px-4 py-4">
          <div className="bg-[#111827] rounded-3xl shadow-lg py-3">
            <div className="flex items-stretch gap-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Press Enter to send (Shift+Enter for newline)."
                className="flex-1 resize-none bg-transparent border-0 text-white placeholder-gray-400 px-4 py-3 rounded-2xl focus:outline-none focus:ring-0 overflow-y-auto"
                style={{ lineHeight: "24px", maxHeight: "240px" }} // 👈 10 lines * 24px
                aria-label="Message input"
              />

              <div className="flex items-end pr-3">
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

          {/* Items row (only before first message) */}
          {messages.length === 0 && (
            <div className="mt-4 flex justify-center">
              <div className="flex flex-wrap gap-3 items-center">
                {items.map((it) => (
                  <button
                    key={it.name}
                    onClick={() => setActive(it.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm ${active === it.name
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
          )}
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{ role: "user" | "assistant"; text: string }> = ({
  role,
  text,
}) => {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={`px-4 py-3 rounded-2xl max-w-[75%] whitespace-pre-wrap break-words
          ${isUser ? "bg-primary text-white" : "bg-gray-700 text-gray-100"}`}
      >
        {text}
      </div>
    </div>
  );
};

export default NewChat;
