import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Link, Image, ScanText, Share2 } from "lucide-react";
import { BedrockFlowService } from "../services/BedrockFlowService";

type ChatInputWithItemsProps = {
  onSend?: (
    text: string,
    active: string
  ) => Promise<string | void> | string | void;
  initialActive?: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const items = [
  { name: "Text", icon: <ScanText size={16} /> },
  { name: "Media", icon: <Image size={16} /> },
  { name: "URLs", icon: <Link size={16} /> },
  { name: "X", icon: <Share2 size={16} /> },
];

const NewChat: React.FC<ChatInputWithItemsProps> = ({
  onSend,
  initialActive = "Text",
}) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [active, setActive] = useState(initialActive);
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const bedrockService = useRef(new BedrockFlowService());

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        10 * 24
      )}px`;
    }
  }, [text]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);

    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let replyText = "";

      if (["Text", "URLs", "X", "Media"].includes(active)) {
        setText("");
        replyText = await bedrockService.current.analyzeContent(
          text.trim(),
          active as 'Text' | 'URLs' | 'X' | 'Media'
        );
      } else {
        replyText = await onSend?.(text.trim(), active) || `Processed: ${text.trim()}`;
      }

      const replyMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: typeof replyText === "string" ? replyText : `Processed: ${text.trim()}`,
      };
      setMessages((prev) => [...prev, replyMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMsg]);
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

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`h-screen darkBg flex flex-col relative ${!hasMessages ? "justify-center" : ""
        }`}
    >
      {/* Chat content area */}
      <div
        className={`${hasMessages ? "flex-1" : ""
          } scrollable w-full overflow-y-auto mt-20 mb-24 px-4 flex flex-col items-center min-h-0`}
      >
        {/* Heading (only before first message) */}
        {!hasMessages && (
          <h1 className="mb-8 text-4xl text-primary/95 font-semibold">
            Let's See If It's Real
          </h1>
        )}

        <div className="w-full max-w-4xl space-y-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} text={m.text} />
          ))}
          <div ref={endOfMessagesRef} />
          {sending && (
            <div className="w-full flex justify-start">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Input container */}
      <div
        className={`${hasMessages ? "absolute bottom-6 left-0 right-0" : ""}
          w-full`}
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-0">
          <div className="bg-[#111827] rounded-3xl shadow-lg py-3">
            <div className="flex items-stretch gap-4">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Press Enter to send (Shift+Enter for newline)."
                className="flex-1 resize-none bg-transparent border-0 text-white placeholder-gray-400 px-4 py-3 rounded-2xl focus:outline-none focus:ring-0 overflow-hidden"
                style={{ lineHeight: "24px", maxHeight: "240px" }}
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
          {!hasMessages && (
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
