import { useState } from "react";
import { X, Sparkles, Cpu, Bot, Volume2, VolumeX, User, Key, Check, Info, Layout } from "lucide-react";
import { ThemeType, UserProfile } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  systemInstruction: string;
  setSystemInstruction: (inst: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  systemInstruction,
  setSystemInstruction,
  selectedModel,
  setSelectedModel,
  voiceActive,
  setVoiceActive,
  user,
  setUser,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "model" | "profile">("general");
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedPlan, setEditedPlan] = useState(user.plan);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    setUser({
      ...user,
      name: editedName,
      email: editedEmail,
      plan: editedPlan,
    });
  };

  const getThemeAura = () => {
    if (theme === "neon-purple") return "border-purple-500/30 shadow-purple-500/10";
    if (theme === "neon-orange") return "border-orange-500/30 shadow-orange-500/10";
    return "border-purple-500/20 shadow-purple-500/5";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Glassmorphic settings container */}
      <div className={`relative w-full max-w-2xl bg-black/80 border ${getThemeAura()} rounded-2xl overflow-hidden shadow-2xl z-10 transition-all duration-300`}>
        {/* Glow corner elements */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-25 rounded-full ${
          theme === "neon-purple" ? "bg-purple-500" : theme === "neon-orange" ? "bg-orange-500" : "bg-gradient-to-tr from-purple-500 to-orange-500"
        }`} />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${theme === "neon-orange" ? "text-orange-400" : "text-purple-400"}`} />
            <span className="font-display font-semibold text-lg tracking-tight">Nemon Workspace Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body columns */}
        <div className="flex flex-col md:flex-row h-[420px] relative z-10">
          {/* Sidebar tabs */}
          <div className="w-full md:w-48 border-r border-white/5 bg-white/2 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap grow md:grow-0 ${
                activeTab === "general"
                  ? "bg-white/10 text-white border-l-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layout className="w-4 h-4" />
              General & Theme
            </button>
            <button
              onClick={() => setActiveTab("model")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap grow md:grow-0 ${
                activeTab === "model"
                  ? "bg-white/10 text-white border-l-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Cpu className="w-4 h-4" />
              Intelligence Engine
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all text-left whitespace-nowrap grow md:grow-0 ${
                activeTab === "profile"
                  ? "bg-white/10 text-white border-l-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-4 h-4" />
              User Profile
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Workspace Interface Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme("neon-purple")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                        theme === "neon-purple"
                          ? "bg-purple-950/20 border-purple-500 text-purple-300"
                          : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-purple-500 shadow-neon-purple shadow-[0_0_10px_purple]" />
                      <span className="text-xs font-medium">Cosmic Purple</span>
                    </button>

                    <button
                      onClick={() => setTheme("neon-orange")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                        theme === "neon-orange"
                          ? "bg-orange-950/20 border-orange-500 text-orange-300"
                          : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-orange-500 shadow-neon-orange shadow-[0_0_10px_orange]" />
                      <span className="text-xs font-medium">Solar Flame</span>
                    </button>

                    <button
                      onClick={() => setTheme("neon-dual")}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                        theme === "neon-dual"
                          ? "bg-purple-950/10 border-white/30 text-white"
                          : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
                      <span className="text-xs font-medium">Nemon Hybrid</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Audio Feedbacks</h3>
                  <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      {voiceActive ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5 text-gray-500" />}
                      <div>
                        <p className="text-sm font-medium text-white">TTS Response Narration</p>
                        <p className="text-xs text-gray-400">Speak generated chatbot answers automatically.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVoiceActive(!voiceActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        voiceActive ? "bg-purple-600" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          voiceActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "model" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Model Architecture</h3>
                  <div className="space-y-2">
                    {[
                      {
                        id: "nemon-flash",
                        name: "Nemon Flash",
                        tag: "Highly Responsive",
                        desc: "Fast responses, coding assistance, and daily productivity tasks.",
                      },
                      {
                        id: "nemon-pro",
                        name: "Nemon Pro",
                        tag: "Advanced Reasoning",
                        desc: "Deep analysis, research, and complex problem solving.",
                      },
                      {
                        id: "nemon-vision",
                        name: "Nemon Vision",
                        tag: "Multimodal AI",
                        desc: "Image understanding, document analysis, and visual reasoning.",
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedModel(item.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          selectedModel === item.id
                            ? "bg-purple-950/10 border-purple-500"
                            : "bg-white/2 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="mt-0.5">
                          {selectedModel === item.id ? (
                            <div className="bg-purple-500 rounded-full p-0.5 text-black">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/25" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{item.name}</span>
                            <span className="text-[10px] font-medium font-display px-1.5 py-0.5 bg-white/5 text-gray-300 rounded border border-white/10">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Default System instructions</h3>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full h-20 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500 resize-none hover:border-white/20 transition-colors"
                    placeholder="Enter custom assistant behaviors..."
                  />
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-xl mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-full border-2 border-purple-500 shadow-neon-purple object-cover"
                  />
                  <div>
                    <h4 className="text-base font-semibold text-white">{user.name}</h4>
                    <p className="text-xs text-purple-400 font-mono font-medium">{user.plan}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Member Since: {user.joined}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Username</label>
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">User Email</label>
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Workspace Tier Profile</label>
                  <select
                    value={editedPlan}
                    onChange={(e: any) => setEditedPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Free Tier" className="bg-[#050505] text-white">Free Developer Sandbox</option>
                    <option value="Pro Member" className="bg-[#050505] text-white">Nemon Pro SaaS ($20/Mo)</option>
                    <option value="Enterprise AI" className="bg-[#050505] text-white">Enterprise Hyperscale</option>
                  </select>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 font-semibold text-xs text-white rounded-xl transition-all shadow-neon-purple"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save User Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner Footer */}
        <div className="bg-white/5 border-t border-white/5 px-6 py-3 flex items-start gap-2 text-[11px] text-gray-400 select-none relative z-10 font-mono">
          <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span>
            Nemon AI utilizes secure cloud intelligence through encrypted API routing.
            All conversations are processed through protected server-side endpoints
            powered by Nemon AI infrastructure.
          </span>
        </div>
      </div>
    </div>
  );
}