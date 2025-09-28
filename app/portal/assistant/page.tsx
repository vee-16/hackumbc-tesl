"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


type Msg = { role: "user" | "assistant"; content: string };

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI IT assistant. I can help you troubleshoot technical issues, answer questions about software, hardware, and provide step-by-step solutions. What can I help you with today?",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

    async function send() {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const next = [...messages, { role: "user", content: trimmed } as Msg];
      setMessages(next);
      setText("");
      setLoading(true);

      try {
        const payload = {
          messages: next.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        };

        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const reason = data?.error || `HTTP ${res.status}`;
          setMessages(prev => [
            ...prev,
            { role: "assistant", content: `Sorry — ${reason}.` },
          ]);
          return;
        }

        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

      } catch {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Sorry — I ran into an error. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-slate-600">Get instant help with your technical issues</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bot className="h-5 w-5" /> IT Support Chat
            </CardTitle>
            <span className="text-xs opacity-90">Powered by AI</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={listRef} className="h-[420px] overflow-y-auto p-4">
            <ul className="space-y-3">
              {messages.map((m, i) => (
                <li
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white"
                      : "mr-auto max-w-[90%] rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-900 prose prose-sm max-w-none"
                  }
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </li>

              ))}
              {loading && (
                <li className="mr-auto max-w-[90%] rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
                  Thinking…
                </li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-200 p-4">
            <Input
              placeholder="Type your question or describe your issue..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={send} disabled={loading} className="bg-indigo-600 text-white hover:bg-indigo-500">
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
            {/*<Link href="/portal/submit-ticket" className="text-sm text-indigo-700 hover:underline">*/}
            {/*  Submit Ticket*/}
            {/*</Link>*/}
          </div>

          <p className="px-4 pb-4 text-xs text-slate-500">
            AI responses may not always be accurate. For complex issues, consider submitting a ticket.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
