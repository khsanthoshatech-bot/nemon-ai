/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser
} from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { Menu, ShieldCheck, Cpu } from "lucide-react";
import { ChatSession, Message, ThemeType, UserProfile, Attachment } from "./types";
import Sidebar from "./components/Sidebar";
import ParticleBackground from "./components/ParticleBackground";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import SettingsModal from "./components/SettingsModal";

const SEED_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "⚙️ Express Router Config",
    model: "nemon-flash",
    favorite: true,
    lastUpdated: "Just Now",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Draft a modern express router configuration for typescript systems.",
        timestamp: "2:15 PM"
      },
      {
        id: "msg-2",
        role: "model",
        content: "Here is an optimized express router template...",
        timestamp: "2:16 PM",
        model: "nemon-flash",
        reactions: { thumbsUp: true }
      }
    ]
  }
];

const DEFAULT_USER: UserProfile = {
  name: "Guest User",
  email: "offline@nemon.ai",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120",
  plan: "Nemon Free",
  joined: "Jun 2026"
};

export default function App() {
  const { user: clerkUser, isSignedIn } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeType>("neon-purple");
  const [selectedModel, setSelectedModel] = useState("nemon-flash");
  const [systemInstruction, setSystemInstruction] = useState("You are Nemon AI...");
  const [voiceActive, setVoiceActive] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [sessions, setSessions] = useState<ChatSession[]>(SEED_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string | null>("session-1");
  const [isGenerating, setIsGenerating] = useState(false);

  // STEP 1: Add prompt counter state
  const [promptCount, setPromptCount] = useState(
    Number(localStorage.getItem("promptCount") || "0")
  );

  // Sync Clerk authentication state with internal user profile
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      setUser({
        name: clerkUser.fullName || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatar: clerkUser.imageUrl,
        plan: "Nemon Free",
        joined: "Jun 2026"
      });
    }
  }, [clerkUser, isSignedIn]);

  // Load persistence
  useEffect(() => {
    const savedSessions = localStorage.getItem("nemon_sessions");
    if (savedSessions) try { setSessions(JSON.parse(savedSessions)); } catch (e) { console.error(e); }
  }, []);

  const saveSessionsToCache = (newSessions: ChatSession[]) => {
    setSessions(newSessions);
    localStorage.setItem("nemon_sessions", JSON.stringify(newSessions));
  };

  const getActiveSession = () => sessions.find((s) => s.id === activeSessionId) || null;

  const handleSendMessage = async (
    text: string,
    attachments: Attachment[]
  ) => {
    // STEP 2: Add login check
    if (!isSignedIn && promptCount >= 15) {
      alert("Please sign in to continue using Nemon AI");
      return;
    }

    const activeSession = getActiveSession();

    if (!activeSession) return;

    // STEP 3: Increase count after sending
    const newCount = promptCount + 1;
    setPromptCount(newCount);
    localStorage.setItem("promptCount", String(newCount));

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      attachments,
    };

    const updatedSessions = sessions.map((s) =>
      s.id === activeSession.id
        ? {
            ...s,
            messages: [...s.messages, userMessage],
            lastUpdated: "Just Now",
          }
        : s
    );

    saveSessionsToCache(updatedSessions);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...activeSession.messages, userMessage],
          model: selectedModel,
          systemInstruction,
        }),
      });

      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No response stream");
      }

      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = new TextDecoder().decode(value);

        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.replace("data: ", "");

          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.text) {
              aiText += parsed.text;
            }
          } catch {}
        }
      }

      const aiMessage: Message = {
        id: `${Date.now()}-ai`,
        role: "model",
        content: aiText,
        timestamp: new Date().toLocaleTimeString(),
        model: selectedModel,
      };

      const finalSessions = updatedSessions.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              messages: [...s.messages, aiMessage],
            }
          : s
      );

      saveSessionsToCache(finalSessions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getThemeAuraGradients = () => {
    if (theme === "neon-purple") return "from-purple-500/5 via-transparent to-transparent";
    return "from-purple-500/5 via-transparent to-orange-500/5";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] relative select-none">
      <ParticleBackground theme={theme} />
      <div className={`absolute inset-0 bg-gradient-to-tr ${getThemeAuraGradients()} pointer-events-none z-0`} />

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        // STEP 4: Fix Launch New Workspace
        onNewSession={() => {
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: "New Workspace Thread",
            model: selectedModel,
            favorite: false,
            lastUpdated: "Just Now",
            messages: [],
          };

          const updatedSessions = [newSession, ...sessions];

          setSessions(updatedSessions);
          localStorage.setItem(
            "nemon_sessions",
            JSON.stringify(updatedSessions)
          );

          setActiveSessionId(newSession.id);
        }} 
        onDeleteSession={() => {}}
        onToggleFavorite={() => {}}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        user={user}
        onLogout={() => {}}
        onOpenLogin={() => {}}
      />

      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10 bg-transparent">
        <header className="h-[65px] border-b border-white/5 bg-black/15 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 relative shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.8 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl transition-all">
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col">
              <h2 className="font-display font-medium text-xs sm:text-sm text-gray-100">{getActiveSession()?.title || "Workspace"}</h2>
              <span className="text-[10px] text-gray-500 font-mono mt-1 uppercase">NEMON SECURE • {selectedModel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-purple-600 rounded-xl text-white text-sm hover:bg-purple-500 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/2 border border-white/5 rounded-xl font-mono text-[10px] text-gray-500">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>GPU LATENCY: 22MS</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/10 border border-purple-500/25 rounded-xl font-mono text-[10px] text-purple-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>SECURE ENDPOINT</span>
            </div>
          </div>
        </header>

        <ChatArea session={getActiveSession()} onSendMessage={handleSendMessage} isGenerating={isGenerating} theme={theme} user={user} onRegenerate={() => {}} onReact={() => {}} />
        <div className="pb-6 pt-2 shrink-0">
          <InputArea onSendMessage={handleSendMessage} isGenerating={isGenerating} theme={theme} />
        </div>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        systemInstruction={systemInstruction}
        setSystemInstruction={setSystemInstruction}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        voiceActive={voiceActive}
        setVoiceActive={setVoiceActive}
        user={user}
        setUser={setUser}
      />
    </div>
  );
}