import { useState, useRef } from "react";
import { ArrowLeft, Send, Mic, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";

type Message = { role: "user" | "bot"; text: string };

const defaultMessages: Message[] = [
  { role: "bot", text: "Hello! I'm Mitra Assistant 🤖 Ask me about weather, safety, or navigation." },
];

const Chatbot = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input };
    const botReply: Message = {
      role: "bot",
      text: getBotReply(input.toLowerCase()),
    };
    setMessages((prev) => [...prev, userMsg, botReply]);
    setInput("");
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
  };

  const getBotReply = (msg: string): string => {
    if (msg.includes("weather")) return "Current conditions are calm. Temperature 28°C, wind 15km/h. Safe to proceed! ✅";
    if (msg.includes("safe") || msg.includes("danger")) return "Sea conditions are safe right now. Stay alert and keep your radio on. 🟢";
    if (msg.includes("fish")) return "High fish activity detected near coordinates 12.97°N, 74.78°E. Best time: next 2 hours. 🐟";
    return "I can help with weather, safety, and navigation. Try asking about today's weather!";
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="px-5 pt-6 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-muted">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{t("chatbot")}</h1>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-secondary-foreground rounded-bl-md"
            }`}>
              {msg.text}
              {msg.role === "bot" && (
                <button onClick={() => speak(msg.text)} className="ml-2 inline-block opacity-60 hover:opacity-100">
                  <Volume2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-20 pt-2 border-t border-border bg-background">
        <div className="flex gap-2">
          <button onClick={startVoice} className="p-3 rounded-full bg-secondary text-secondary-foreground">
            <Mic size={20} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 h-12 px-4 rounded-full border border-input bg-card text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          />
          <button onClick={sendMessage} className="p-3 rounded-full bg-primary text-primary-foreground">
            <Send size={20} />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chatbot;
