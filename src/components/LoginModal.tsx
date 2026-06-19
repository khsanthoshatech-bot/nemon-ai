import React, { useState } from "react";
import { X, Lock, Mail, User, Sparkles, Terminal, Shield, Check } from "lucide-react";
import { ThemeType, UserProfile } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  onAuthComplete: (profile: UserProfile) => void;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=120",
];

export default function LoginModal({ isOpen, onClose, theme, onAuthComplete }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedTier, setSelectedTier] = useState<"Free Tier" | "Pro Member" | "Enterprise AI">("Pro Member");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Structure a personalized profile based on fields filled
    const mockProfile: UserProfile = {
      name: username || (email ? email.split("@")[0] : "Nemon Developer"),
      email: email || "dev@nemon.ai",
      avatar: selectedAvatar,
      plan: selectedTier,
      joined: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" }),
    };

    onAuthComplete(mockProfile);
    onClose();
  };

  const getThemeAura = () => {
    if (theme === "neon-purple") return "border-purple-500/30 shadow-purple-500/10";
    if (theme === "neon-orange") return "border-orange-500/30 shadow-orange-500/10";
    return "border-purple-500/20 shadow-purple-500/5";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Glass Panel */}
      <div className={`relative w-full max-w-md bg-black/85 border ${getThemeAura()} rounded-2xl overflow-hidden shadow-2xl z-10 p-6`}>
        {/* Glow Halo */}
        <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 rounded-full ${
          theme === "neon-purple" ? "bg-purple-500" : theme === "neon-orange" ? "bg-orange-500" : "bg-gradient-to-tr from-purple-500 to-orange-500"
        }`} />

        {/* Header Block */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${theme === "neon-orange" ? "text-orange-400" : "text-purple-400"}`} />
            <span className="font-display font-semibold text-base tracking-tight text-white">Nemon Security Gateway</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 pb-2.5 text-center font-display font-medium text-sm transition-all focus:outline-none ${
              activeTab === "login"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign-In Core
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 pb-2.5 text-center font-display font-medium text-sm transition-all focus:outline-none ${
              activeTab === "signup"
                ? "text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Provision Account
          </button>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Mailing Node Code (Email)</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@nemon.ai"
                className="w-full pl-10 pr-3 py-2 bg-white/2 hover:bg-white/3 border border-white/5 focus:border-purple-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {activeTab === "signup" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Choose Handle Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="CyberCommander"
                    className="w-full pl-10 pr-3 py-2 bg-white/2 hover:bg-white/3 border border-white/5 focus:border-purple-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Select Neuro-Avatar</label>
                <div className="flex gap-2 justify-between">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedAvatar === av ? "border-purple-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                      {selectedAvatar === av && (
                        <div className="absolute inset-0 bg-purple-950/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">SaaS Tier Partition</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTier("Pro Member")}
                    className={`p-2.5 border rounded-xl text-left transition-all ${
                      selectedTier === "Pro Member"
                        ? "bg-purple-950/20 border-purple-500"
                        : "bg-white/2 border-white/5"
                    }`}
                  >
                    <p className="text-[11px] font-bold text-white uppercase">Pro Core</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Dual-Stream Reasoning</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTier("Enterprise AI")}
                    className={`p-2.5 border rounded-xl text-left transition-all ${
                      selectedTier === "Enterprise AI"
                        ? "bg-orange-950/20 border-orange-500"
                        : "bg-white/2 border-white/5"
                    }`}
                  >
                    <p className="text-[11px] font-bold text-white uppercase">Enterprise</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Isolated VPC Nodes</p>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Access Pass Code (Password)</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-2 bg-white/2 hover:bg-white/3 border border-white/5 focus:border-purple-500/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 hover:brightness-110 active:scale-[0.98] text-sm font-semibold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            {activeTab === "login" ? "Establish Terminal Session" : "Deploy Account Node"}
          </button>
        </form>

        {/* Footer info lock */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-mono">
          <Terminal className="w-3.5 h-3.5 text-purple-500/60" />
          <span>AES-KEYRING PROTOCOL ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
