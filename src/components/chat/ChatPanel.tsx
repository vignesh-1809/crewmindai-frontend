import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Image as ImageIcon, Send, MessageSquare } from "lucide-react";

interface Message { id: string; role: "user" | "assistant"; content: string; imageUrl?: string; ts: number }
type ChatPanelProps = { selected?: string | null; selectedMachineId?: string | null; machines?: string[] };

export function ChatPanel({ selected, selectedMachineId = null, machines = [] }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [imagePreview, setImagePreview] = useState<string | undefined>();


  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [contexts, setContexts] = useState<string[]>([]);



  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);



  const onSend = async () => {
    if (loading) return;
    if (!input && !imagePreview) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: input || (imagePreview ? "[Image attached]" : ""), imageUrl: imagePreview, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setImagePreview(undefined);
    try {
      setLoading(true);
      // Don't add machine context for simple greetings
      const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings)$/i.test(input.trim());
      
      // Get recent conversation context (last 2-3 messages for context)
      const recentMessages = messages.slice(-4); // Last 4 messages for context
      let conversationContext = '';
      if (recentMessages.length > 0) {
        conversationContext = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      }
      
      let enrichedQuery = input;
      if (selected && !isGreeting) {
        enrichedQuery = `${input} (Machine context: ${selected})`;
      }
      if (conversationContext && !isGreeting) {
        enrichedQuery = `Recent conversation:\n${conversationContext}\n\nCurrent question: ${enrichedQuery}`;
      }
      // Attempt streaming first
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const resp = await fetch(`${API_BASE_URL}/api/query/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enrichedQuery,
          topK: 4,
          machine: selected || undefined,
          machineId: selectedMachineId || undefined,
        })
      });
      let finalText = '';
      let usedContextsLocal: string[] = [];
      if (!resp.ok || !resp.body) {
        // fallback to non-streaming
        const fallback = await fetch(`${API_BASE_URL}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: enrichedQuery,
            topK: 4,
            machine: selected || undefined,
            machineId: selectedMachineId || undefined,
          })
        });
        if (!fallback.ok) throw new Error(`API ${fallback.status}`);
        const data: { answer: string; contexts?: string[] } = await fallback.json();
        setContexts(data.contexts || []);
        const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: data.answer || 'No answer returned.', ts: Date.now() };
        setMessages((m) => [...m, reply]);
        finalText = reply.content;
        usedContextsLocal = data.contexts || [];
      } else {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let acc = '';
        let currentContexts: string[] = [];
        // initialize assistant message
        const id = crypto.randomUUID();
        setMessages((m) => [...m, { id, role: 'assistant', content: '', ts: Date.now() }]);
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx;
          while ((idx = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, idx).trim();
            buffer = buffer.slice(idx + 1);
            if (!line) continue;
            try {
              const obj = JSON.parse(line);
              if (Array.isArray(obj.contexts)) { currentContexts = obj.contexts; setContexts(obj.contexts); }
              if (typeof obj.delta === 'string') {
                acc += obj.delta;
                const delta = obj.delta;
                setMessages((m) => m.map(msg => msg.id === id ? { ...msg, content: msg.content + delta } : msg));
              }
            } catch { /* ignore */ }
          }
        }
        finalText = acc;
        usedContextsLocal = currentContexts;
        // defer TTS to unified handler below
      }

      const hay = `${finalText}\n${(usedContextsLocal || []).join('\n')}`.toLowerCase();
      const match = machines.find((m) => hay.includes(m.toLowerCase()));
      if (match) {
        window.dispatchEvent(new CustomEvent('assistant:focus', { detail: match }));
      }
    } catch (err) {
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.', ts: Date.now() };
      setMessages((m) => [...m, reply]);

    } finally {
      setLoading(false);
    }
  };



  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  return (
    <div className="h-full flex flex-col rounded-lg">
      <div className="flex items-center justify-center mb-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-foreground/80">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Text Chat Session</span>
        </div>
      </div>
      {selected && (
        <div className="flex justify-center mb-2">
          <div className="text-[11px] px-2 py-1 rounded bg-secondary text-foreground/80">Focused: {selected}</div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {messages.map((m) => {
          const time = new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
              {!isUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="AI" />
                  <AvatarFallback className="bg-blue-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[78%] ${isUser ? 'items-end text-right' : ''}`}>
                <div className={`rounded-2xl px-4 py-2 border ${isUser ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white border-transparent' : 'bg-muted'} `}>
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="uploaded context" className="mb-2 rounded-md max-h-40 w-auto" loading="lazy" />
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className={`mt-1 text-[11px] text-muted-foreground ${isUser ? '' : ''}`}>{time}</div>
              </div>
              {isUser && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 space-y-2">
        {imagePreview && (
          <div className="flex items-center gap-2 text-xs">
            <img src={imagePreview} alt="preview" className="h-10 w-10 rounded object-cover" />
            <span>Image attached</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-end gap-2 rounded-xl border bg-background px-3 py-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type your message..."
              className="min-h-11 max-h-28 flex-1 border-0 focus-visible:ring-0 focus-visible:outline-none resize-none"
            />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Attach image">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button onClick={onSend} aria-label="Send" disabled={loading} className="bg-gradient-to-r from-violet-600 to-blue-600 text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {contexts.length > 0 && (
          <div className="text-[11px] text-muted-foreground">Sources: {contexts.length}</div>
        )}
      </div>
    </div>
  );
}
