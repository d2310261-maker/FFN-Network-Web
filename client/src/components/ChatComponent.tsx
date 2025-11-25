import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { ChatMessage } from "@shared/schema";
import { format } from "date-fns";

interface ChatComponentProps {
  gameId?: string;
  messages: ChatMessage[];
  onSendMessage: (username: string, message: string) => void;
}

export function ChatComponent({ messages, onSendMessage }: ChatComponentProps) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [usernameSet, setUsernameSet] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem("nfl-chat-username");
    if (savedUsername) {
      setUsername(savedUsername);
      setUsernameSet(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSetUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("nfl-chat-username", username.trim());
      setUsernameSet(true);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && username.trim()) {
      onSendMessage(username.trim(), message.trim());
      setMessage("");
    }
  };

  if (!usernameSet) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 gap-4">
        <h3 className="text-lg font-semibold">Join the Chat</h3>
        <p className="text-sm text-muted-foreground text-center">
          Enter a username to start chatting with other fans
        </p>
        <form onSubmit={handleSetUsername} className="w-full max-w-sm space-y-3">
          <Input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={100}
            data-testid="input-username"
          />
          <Button type="submit" className="w-full" data-testid="button-set-username">
            Continue
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Chat</h3>
          <span className="text-sm text-muted-foreground" data-testid="text-chat-username">
            {username}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-1" data-testid={`message-${msg.id}`}>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold" data-testid={`message-username-${msg.id}`}>
                    {msg.username}
                  </span>
                  <span className="text-xs text-muted-foreground" data-testid={`message-time-${msg.id}`}>
                    {format(new Date(msg.createdAt!), "h:mm a")}
                  </span>
                </div>
                <div className="bg-muted rounded-md px-3 py-2 inline-block max-w-full break-words">
                  <p className="text-sm" data-testid={`message-text-${msg.id}`}>{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            data-testid="input-chat-message"
          />
          <Button type="submit" size="icon" data-testid="button-send-message">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
