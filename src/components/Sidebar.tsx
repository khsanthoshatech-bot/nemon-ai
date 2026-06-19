import { useState } from "react";
import { 
  Plus, Search, MessageSquare, Trash2, Settings, LogOut, 
  ChevronLeft, Menu, Star, Sparkles, User, LogIn, Lock 
} from "lucide-react";
import { ChatSession, ThemeType, UserProfile } from "../types";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSettings: () => void;
  theme: ThemeType;
  user: UserProfile;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onToggleFavorite,
  onOpenSettings,
  theme,
  user,
  onLogout,
  onOpenLogin
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Filter conversations
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getThemeHighlight = () => {
    if (theme === "neon-purple") return "text-purple-400";
    if (theme === "neon-orange") return "text-orange-400";
    return "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400";
  };

  const getThemeGlowButton = () => {
    if (theme === "neon-purple") return "border-purple-500/40 text-purple-300 hover:bg-purple-950/20 shadow-neon-purple";
    if (theme === "neon-orange") return "border-orange-500/40 text-orange-300 hover:bg-orange-950/20 shadow-neon-orange";
    return "border-purple-500/30 text-white hover:bg-white/5 shadow-neon-dual";
  };

  const isUserAuthenticated = user.email !== "offline@nemon.ai";

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-black/75 lg:bg-black/40 border-r border-white/5 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          isOpen ? "w-[270px]" : "w-0 lg:w-[68px] overflow-hidden"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 h-[65px] shrink-0">
          {isOpen ? (
            <div className="flex items-center gap-2 select-none">
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                Nemon<span className={`ml-1 font-medium font-sans text-sm ${getThemeHighlight()}`}>AI</span>
              </span>
            </div>
          ) : (
            <div className="mx-auto select-none">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
            </div>
          )}

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="lg:flex hidden p-1 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Chat Button Row */}
        <div className="p-3 shrink-0">
          {isOpen ? (
            <button
              onClick={() => {
                onNewSession();
                // Close on mobile
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 border rounded-xl font-display font-medium text-xs tracking-wide transition-all cursor-pointer ${getThemeGlowButton()}`}
            >
              <Plus className="w-4 h-4 text-purple-400" />
              Launch New Workspace
            </button>
          ) : (
            <button
              onClick={onNewSession}
              className={`mx-auto w-10 h-10 flex items-center justify-center border border-white/10 rounded-xl hover:bg-white/5 text-gray-300 transition-all cursor-pointer`}
              title="Launch Thread"
            >
              <Plus className="w-4.5 h-4.5 text-purple-400" />
            </button>
          )}
        </div>

        {/* Active search filter */}
        {isOpen && (
          <div className="px-3 mb-2 shrink-0">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.8 bg-white/2 hover:bg-white/4 border border-white/5 focus:border-purple-500/40 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Recent Conversations Scroll List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {isOpen ? (
            <>
              <div className="px-2 py-1 select-none">
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                  Recent Threads
                </span>
              </div>

              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center select-none">
                  <p className="text-xs text-gray-600">No matching spaces</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  return (
                    <div
                      key={session.id}
                      className={`group relative flex items-center justify-between rounded-xl p-2.5 text-sm transition-all cursor-pointer ${
                        isActive
                          ? "bg-white/8 border border-white/10 text-white shadow-neon-purple/5"
                          : "text-gray-400 hover:text-gray-100 hover:bg-white/3"
                      }`}
                      onClick={() => {
                        onSelectSession(session.id);
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden min-w-0 pr-8">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${
                          isActive 
                            ? theme === "neon-purple" ? "text-purple-400" : "text-orange-400" 
                            : "text-gray-500 group-hover:text-gray-300"
                        }`} />
                        <span className="truncate font-medium text-xs select-none">
                          {session.title}
                        </span>
                      </div>

                      {/* Floating actions on hover */}
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gradient-to-l from-[#0c0c0e] via-[#0c0c0e] pl-4 py-1 rounded-r-xl transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(session.id);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            session.favorite 
                              ? "text-yellow-500 hover:text-yellow-600" 
                              : "text-gray-500 hover:text-white"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1 rounded-md text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 pt-3">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                      isActive 
                        ? "bg-white/10 text-white border border-white/15" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                    title={session.title}
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    {session.favorite && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer User controls */}
        <div className="border-t border-white/5 p-2 bg-black/20 shrink-0 relative">
          {isOpen ? (
            <div className="space-y-1">
              {/* Quick Preferences Toggler */}
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
              >
                <Settings className="w-4 h-4 text-purple-400" />
                Settings Workspace
              </button>

              {/* Profile Bar */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full border border-purple-500/40 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-purple-400 font-mono font-medium leading-none mt-0.5">{user.plan}</p>
                    </div>
                  </div>
                  {isUserAuthenticated ? (
                    <LogOut className="w-3.5 h-3.5 text-gray-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); onLogout(); }} />
                  ) : (
                    <LogIn className="w-3.5 h-3.5 text-gray-500 hover:text-purple-400" onClick={(e) => { e.stopPropagation(); onOpenLogin(); }} />
                  )}
                </button>

                {/* Profile Modal overlay mini */}
                {showProfileMenu && !isUserAuthenticated && (
                  <div className="absolute bottom-16 left-2 right-2 p-3 bg-black/95 border border-white/10 rounded-2xl shadow-xl z-50 text-center">
                    <Lock className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <p className="text-[11px] text-gray-200 font-medium">Synchronize Cloud Sessions</p>
                    <p className="text-[9px] text-gray-400 mt-1 mb-2">Login to backup chats and access reasoning models securely.</p>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenLogin();
                      }}
                      className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-orange-500 hover:brightness-110 text-[10px] font-semibold text-white rounded-lg transition-all"
                    >
                      Authenticate Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onOpenSettings}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Settings Code Workspace"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => {
                  if (isUserAuthenticated) {
                    onLogout();
                  } else {
                    onOpenLogin();
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all cursor-pointer"
                title={isUserAuthenticated ? "Logout" : "Authenticate Account"}
              >
                {isUserAuthenticated ? <LogOut className="w-4.5 h-4.5 text-red-400" /> : <LogIn className="w-4.5 h-4.5 text-purple-400" />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
