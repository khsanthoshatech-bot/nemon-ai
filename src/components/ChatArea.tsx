import React, { useEffect, useRef, useState } from "react";
import { 
  Sparkles, CornerDownLeft, Copy, Check, MessageSquare, 
  RotateCw, Play, Code, BookOpen, Layers, Terminal, Clock, 
  ThumbsUp, ThumbsDown, Heart, FileText, ChevronRight
} from "lucide-react";
import { Message, ChatSession, Attachment } from "../types";

interface ChatAreaProps {
  session: ChatSession | null;
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  onRegenerate: () => void;
  onReact: (messageId: string, reaction: 'thumbsUp' | 'thumbsDown' | 'loved') => void;
  theme: "neon-purple" | "neon-orange" | "neon-dual";
  user: any;
}

export default function ChatArea({
  session,
  onSendMessage,
  isGenerating,
  onRegenerate,
  onReact,
  theme,
  user,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Smart Auto-scroll: Smoothly glide to bottom if already near it
  useEffect(() => {
    const container = viewportRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    if (distanceFromBottom < 250) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [session?.messages, isGenerating]);

  // Detect user scroll position to show/hide the "Jump to Latest" button
  useEffect(() => {
    const container = viewportRef.current;

    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      setShowScrollButton(distanceFromBottom > 300);
    };

    container.addEventListener("scroll", handleScroll);

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePromptSuggestionClick = (prompt: string) => {
    onSendMessage(prompt, []);
  };

  const hasMessages = session && session.messages && session.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
      {/* Scroll Viewport */}
      <div 
        ref={viewportRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
      >
        {hasMessages ? (
          <div className="max-w-3xl mx-auto space-y-6 relative">
            {session.messages.map((msg, index) => {
              const isLastMsg = index === session.messages.length - 1;
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  theme={theme}
                  onReact={(reaction) => onReact(msg.id, reaction)}
                  onRegenerate={isLastMsg && msg.role === "model" ? onRegenerate : undefined}
                  user={user}
                />
              );
            })}

            {/* AI Streaming/Typing Loader */}
            {isGenerating && session.messages[session.messages.length - 1]?.role !== "model" && (
              <div className="flex gap-4 items-start animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                </div>
                <div className="flex-1 bg-white/4 border border-white/5 rounded-2xl p-4 max-w-[85%]">
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-1.8 h-1.8 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-1.8 h-1.8 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <div className="w-1.8 h-1.8 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                  <span className="text-xs text-gray-400 font-mono italic mt-2 block">Synthesizing response...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        ) : (
          /* Premium Empty Dashboard State */
          <EmptyDashboard 
            theme={theme} 
            onSelectPrompt={handlePromptSuggestionClick} 
            user={user}
          />
        )}
      </div>

      {/* Floating Jump to Latest Button */}
      {showScrollButton && (
        <button
          onClick={() =>
            viewportRef.current?.scrollTo({
              top: viewportRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          className="absolute bottom-6 right-8 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111216] border border-white/10 text-gray-300 text-xs font-semibold shadow-2xl hover:bg-white/10 hover:text-white transition-all cursor-pointer animate-fade-in"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
          Latest
        </button>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: Empty Dashboard (Bento layout suggestion card grid)
// -------------------------------------------------------------
interface EmptyDashboardProps {
  theme: "neon-purple" | "neon-orange" | "neon-dual";
  onSelectPrompt: (prompt: string) => void;
  user: any;
}

function EmptyDashboard({ theme, onSelectPrompt, user }: EmptyDashboardProps) {
  const getThemeHighlight = () => {
    if (theme === "neon-purple") return "text-purple-400";
    if (theme === "neon-orange") return "text-orange-400";
    return "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400";
  };

  const cardPrompts = [
    {
      icon: Terminal,
      title: "Engine Refactoring",
      subtitle: "Optimize data models with clean TypeScript bindings.",
      prompt: "Can you design a premium typescript routing interface for express with built-in telemetry error catch blocks?"
    },
    {
      icon: Code,
      title: "CSS Glassmorphism",
      subtitle: "Create frosted glowing containers using Tailwind utility tags.",
      prompt: "Can you generate a spectacular glassmorphic panel styling class guide using tailwind v4, including glow shadows?"
    },
    {
      icon: BookOpen,
      title: "Query Optimization",
      subtitle: "Benchmark Postgres relational models for fast transaction lookups.",
      prompt: "Draft a high-speed relational SQL query structure for fetching audit logs with deep index key suggestions."
    },
    {
      icon: Layers,
      title: "System Architecture",
      subtitle: "Map layout partitions for edge client and secure server environments.",
      prompt: "Draft an absolute masterclass explanation of full-stack API proxy security. Why should Gemini keys live on server?"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[75vh] select-none text-center">
      {/* Central Nemon Reactor Graphic */}
      <div className="relative mb-6">
        <div className={`absolute -inset-2 rounded-full opacity-35 blur-xl animate-pulse ${
          theme === "neon-purple" ? "bg-purple-500" : theme === "neon-orange" ? "bg-orange-500" : "bg-gradient-to-r from-purple-500 to-orange-500"
        }`} />
        <div className="relative w-16 h-16 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: "12s" }} />
        </div>
      </div>

      <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-none text-white">
        Ignite Your Intelligence with <span className={getThemeHighlight()}>Nemon</span>
      </h1>
      
      <p className="text-sm text-gray-400 mt-3 max-w-lg leading-relaxed">
        Hello <strong>{user?.name || "Developer"}</strong>, connect with Nemon's dual-neural core. 
        Select a partition, attach workspace logs, or type an inquiry to stream instant responses.
      </p>

      {/* Suggestion grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 w-full">
        {cardPrompts.map((cp, idx) => {
          const Icon = cp.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(cp.prompt)}
              className="group text-left p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/15 hover:bg-white/5 transition-all duration-300 relative overflow-hidden focus:outline-none cursor-pointer"
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/0 to-purple-500/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 bg-black border border-white/10 rounded-xl">
                  <Icon className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">
                      {cp.title}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal line-clamp-2">
                    {cp.subtitle}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: Message Bubble (Render + custom Markdown core)
// -------------------------------------------------------------
interface MessageBubbleProps {
  message: Message;
  theme: "neon-purple" | "neon-orange" | "neon-dual";
  onReact: (reaction: 'thumbsUp' | 'thumbsDown' | 'loved') => void;
  onRegenerate?: () => void;
  user: any;
}

function MessageBubble({ message, theme, onReact, onRegenerate, user }: MessageBubbleProps) {
  const isModel = message.role === "model";

  const getThemeBubbleBg = () => {
    if (!isModel) return "bg-white/4 border-white/10 text-white ml-auto";
    return "bg-[#0b0c0f]/80 border-white/5 text-gray-100 mr-auto";
  };

  return (
    <div className={`flex gap-4 items-start ${!isModel ? "flex-row-reverse" : ""} animate-fade-in`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isModel ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
        ) : (
          <img
            src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
            alt={user?.name || "User"}
            className="w-8 h-8 rounded-lg border border-purple-500/30 object-cover"
          />
        )}
      </div>

      {/* Text Bubble Wrapper */}
      <div className="flex-1 max-w-[85%]">
        <div className={`rounded-2xl px-4 py-4 border backdrop-blur-md shadow-lg ${getThemeBubbleBg()}`}>
          {/* Top meta tags (Timestamp & Active Model indicator) */}
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/3 select-none">
            <span className="text-[10px] font-mono text-gray-500">{message.timestamp}</span>
            {isModel && (
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-purple-950/15 border border-purple-500/20 text-purple-400 rounded">
                Active core: {message.model || "gemini-3.5-flash"}
              </span>
            )}
            {message.attachments && message.attachments.length > 0 && (
              <span className="text-[9px] font-mono font-medium text-gray-400">
                • {message.attachments.length} attachment(s)
              </span>
            )}
          </div>

          {/* Render Inline base64 visual attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="p-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-2 max-w-[200px]">
                  {att.type.startsWith("image/") && att.content ? (
                    <img src={att.content} alt={att.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-400" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-gray-200 truncate">{att.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">{att.size}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Core Markdown Body */}
          <div className="markdown-body text-sm leading-relaxed tracking-normal font-sans">
            <MarkdownRenderer content={message.content} theme={theme} />
          </div>
        </div>

        {/* Message Reaction toolbar row */}
        <div className={`flex items-center gap-1.5 mt-2 px-1 select-none ${!isModel ? "justify-end" : "justify-start"}`}>
          {isModel ? (
            <>
              {/* Thumbs up */}
              <button
                onClick={() => onReact('thumbsUp')}
                className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                  message.reactions?.thumbsUp ? "text-purple-400 font-bold" : "text-gray-500 hover:text-gray-300"
                }`}
                title="Helpful reply"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Thumbs down */}
              <button
                onClick={() => onReact('thumbsDown')}
                className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                  message.reactions?.thumbsDown ? "text-purple-400" : "text-gray-500 hover:text-gray-300"
                }`}
                title="Unsatisfactory reply"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {/* Heart */}
              <button
                onClick={() => onReact('loved')}
                className={`p-1.5 rounded hover:bg-white/5 transition-colors cursor-pointer ${
                  message.reactions?.loved ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-gray-300"
                }`}
                title="Love this"
              >
                <Heart className={`w-3.5 h-3.5 ${message.reactions?.loved ? "fill-red-500 text-red-500" : ""}`} />
              </button>

              {/* Regenerate Button trigger */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 py-1 px-2 text-[10px] font-mono text-gray-500 hover:text-purple-400 hover:bg-purple-950/20 active:bg-purple-950/40 rounded transition-all ml-2 border border-transparent hover:border-purple-500/20 cursor-pointer"
                >
                  <RotateCw className="w-3 h-3" />
                  Regenerate response
                </button>
              )}
            </>
          ) : (
            <span className="text-[10px] text-gray-600 font-mono italic">Submitted securely • AES-256</span>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// HELPER: Custom parsing engine for robust markdown render inside react 19
// -------------------------------------------------------------
interface MarkdownRendererProps {
  content: string;
  theme: "neon-purple" | "neon-orange" | "neon-dual";
}

function MarkdownRenderer({ content, theme }: MarkdownRendererProps) {
  if (!content) return null;

  // Split string into text units vs triple-backtick code-blocks
  const parts: { type: "text" | "code"; content: string; language?: string }[] = [];
  const regex = /```([a-zA-Z0-9-.]*)\n([\s\S]*?)```/g;
  
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add code segment
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      });
    }

    parts.push({
      type: "code",
      language: match[1] || "code",
      content: match[2],
    });

    lastIndex = regex.lastIndex;
  }

  // Remainder segment
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-4">
      {parts.map((p, pIdx) => {
        if (p.type === "code") {
          return (
            <CodeHighlightBlock
              key={pIdx}
              language={p.language}
              content={p.content}
            />
          );
        } else {
          // Render formatted paragraph sentences
          return <RichTextParagraphs key={pIdx} text={p.content} />;
        }
      })}
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: Code block with built-in styling, language indicator, copy check
// -------------------------------------------------------------
function CodeHighlightBlock({ language, content }: { language?: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tag = language || "typescript";

  return (
    <div className="relative rounded-xl border border-white/10 bg-black/60 overflow-hidden font-mono mt-3 mb-3 animate-fade-in group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/2 border-b border-white/5 select-none h-[38px]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{tag}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 bg-white/3 hover:bg-white/8 border border-white/5 rounded-md text-[10px] text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-gray-400 group-hover:text-white" />
              <span>Copy snippet</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents viewport */}
      <div className="p-4 overflow-x-auto max-h-[400px] text-xs leading-relaxed text-gray-200">
        <pre className="font-mono">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUB-COMPONENT: Custom Inline Bolding & List item highlighter
// -------------------------------------------------------------
function RichTextParagraphs({ text }: { text: string }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lIdx} className="h-2" />;

        // Check if list bullet
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const isNumbered = /^\d+\.\s/.test(trimmed);

        if (isBullet) {
          const listContent = trimmed.substring(2);
          return (
            <div key={lIdx} className="flex gap-2.5 items-start pl-2">
              <span className="text-purple-400 mt-1.5 font-bold">•</span>
              <span className="text-gray-300 text-sm">
                <InlineFormatter text={listContent} />
              </span>
            </div>
          );
        }

        if (isNumbered) {
          const matchedNum = trimmed.match(/^(\d+)\.\s/);
          const numPrefix = matchedNum ? matchedNum[1] : "1";
          const listContent = trimmed.replace(/^\d+\.\s/, "");
          return (
            <div key={lIdx} className="flex gap-2.5 items-start pl-2">
              <span className="text-purple-400 font-semibold font-mono text-xs mt-0.5">{numPrefix}.</span>
              <span className="text-gray-300 text-sm">
                <InlineFormatter text={listContent} />
              </span>
            </div>
          );
        }

        // Normal heading check
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={lIdx} className="text-base font-semibold font-display text-white mt-4 mb-2 tracking-tight">
              <InlineFormatter text={trimmed.substring(4)} />
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={lIdx} className="text-lg font-bold font-display text-white mt-5 mb-2.5 tracking-tight border-b border-white/5 pb-1">
              <InlineFormatter text={trimmed.substring(3)} />
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={lIdx} className="text-xl font-extrabold font-display text-white mt-6 mb-3 tracking-tight">
              <InlineFormatter text={trimmed.substring(2)} />
            </h1>
          );
        }

        return (
          <p key={lIdx} className="text-gray-300 text-sm leading-relaxed">
            <InlineFormatter text={line} />
          </p>
        );
      })}
    </div>
  );
}

// Formatting **bolds** and `inline-codes` inside standard lines
function InlineFormatter({ text }: { text: string }) {
  // Regex parsing bolds **text** first, then inline-codes `snippet`
  // We will do a simple inline tokenization
  const tokens: { type: "text" | "bold" | "code"; text: string }[] = [];
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  parts.forEach((p) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      tokens.push({ type: "bold", text: p.substring(2, p.length - 2) });
    } else if (p.startsWith("`") && p.endsWith("`")) {
      tokens.push({ type: "code", text: p.substring(1, p.length - 1) });
    } else {
      tokens.push({ type: "text", text: p });
    }
  });

  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === "bold") {
          return <strong key={idx} className="font-semibold text-white">{t.text}</strong>;
        } else if (t.type === "code") {
          return (
            <code key={idx} className="font-mono text-xs font-semibold px-1.5 py-0.5 bg-white/10 rounded border border-white/5 text-purple-300">
              {t.text}
            </code>
          );
        } else {
          return <span key={idx}>{t.text}</span>;
        }
      })}
    </>
  );
}