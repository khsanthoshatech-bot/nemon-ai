import React, { useRef, useState, useEffect } from "react";
import { Mic, MicOff, Paperclip, Send, X, FileText, Image, Loader2, Sparkles } from "lucide-react";
import { Attachment, ThemeType } from "../types";

interface InputAreaProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  theme: ThemeType;
}

export default function InputArea({ onSendMessage, isGenerating, theme }: InputAreaProps) {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      // Simulate voice typing if API unsupported
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        const speechSimulator = [
          "Suggest a refactor pattern for express routers",
          "What is the difference between map and set in javascript",
          "Draft a premium glassmorphism css class"
        ];
        const randomPhrase = speechSimulator[Math.floor(Math.random() * speechSimulator.length)];
        
        let i = 0;
        const interval = setInterval(() => {
          if (i < randomPhrase.length) {
            setInputText((prev) => prev + randomPhrase.charAt(i));
            i++;
          } else {
            clearInterval(interval);
            setIsListening(false);
          }
        }, 40);
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      alert("Nemon limit is 8MB per document attachment.");
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const img = new window.Image();
  
        img.onload = () => {
          const canvas = document.createElement("canvas");
  
          let width = img.width;
          let height = img.height;
  
          const MAX_WIDTH = 1024;
  
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext("2d");
  
          if (!ctx) return;
  
          ctx.drawImage(img, 0, 0, width, height);
  
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
  
          const newAttachment: Attachment = {
            name: file.name,
            type: "image/jpeg",
            size: `${(file.size / 1024).toFixed(1)} KB`,
            content: compressedBase64,
          };
  
          setAttachments((prev) => [...prev, newAttachment]);
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.readAsDataURL(file);
      return;
    }
  
    // Existing document code for text/code files
    const reader = new FileReader();
  
    reader.onload = (event) => {
      if (event.target?.result) {
        const newAttachment: Attachment = {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          content: event.target.result as string,
        };
  
        setAttachments((prev) => [...prev, newAttachment]);
      }
    };
  
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(processFile);
    }
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    if (isGenerating) return;

    onSendMessage(inputText, attachments);
    setInputText("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getThemeFocusBorder = () => {
    if (theme === "neon-purple") return "focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/15";
    if (theme === "neon-orange") return "focus-within:border-orange-500/50 focus-within:ring-2 focus-within:ring-orange-500/15";
    return "focus-within:border-purple-500/40 focus-within:ring-2 focus-within:ring-purple-500/10";
  };

  const getThemeButton = () => {
    if (theme === "neon-purple") return "bg-purple-600 hover:bg-purple-500 text-white shadow-neon-purple";
    if (theme === "neon-orange") return "bg-orange-600 hover:bg-orange-500 text-white shadow-neon-orange";
    return "bg-gradient-to-r from-purple-600 to-orange-500 hover:brightness-110 text-white shadow-neon-dual";
  };

  return (
    <div className="w-full relative px-4 md:px-0 max-w-3xl mx-auto z-10 shrink-0">
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all duration-300 rounded-2xl bg-black/55 backdrop-blur-xl border ${
          isDragging 
            ? "border-purple-500 bg-purple-950/10" 
            : "border-white/10"
        } ${getThemeFocusBorder()}`}
      >
        {/* Glow halo overlay */}
        <div className={`absolute -inset-0.5 rounded-2xl opacity-10 blur-md pointer-events-none transition-opacity ${
          isGenerating ? "bg-gradient-to-r from-purple-500 to-orange-500" : ""
        }`} />

        {/* Selected Attachments list drawer */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-white/2 border-b border-white/5 rounded-t-2xl">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg text-xs text-gray-300 relative group animate-fade-in"
              >
                {att.type.startsWith("image/") ? (
                  <div className="relative w-4 h-4 rounded overflow-hidden flex-shrink-0">
                    <img src={att.content} alt={att.name} className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <FileText className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                )}
                <span className="max-w-[120px] truncate font-mono text-[10px] sm:text-xs">
                  {att.name}
                </span>
                <span className="text-[9px] text-gray-500 font-mono">({att.size})</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-0.5 text-gray-500 hover:text-white rounded-md hover:bg-white/10 transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main interactive key box */}
        <div className="flex items-end gap-2 p-3 relative bg-transparent">
          {/* File input click trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex-shrink-0"
            title="Attach documents/images"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,text/*,.json,.js,.ts,.tsx,.css,.html"
          />

          {/* Autogrow Textarea */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDragging ? "Drop your workspace files here..." : "Ignite Nemon AI... (Press Enter to query)"}
            className="flex-1 max-h-32 min-h-[44px] py-2 px-1.5 bg-transparent text-sm text-gray-100 placeholder-gray-500 border-none outline-none resize-none focus:outline-none"
            rows={1}
            disabled={isGenerating}
          />

          {/* Action Row */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Typing mic controls */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500/10 text-red-500 animate-pulse border border-red-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
              title={isListening ? "Listening voice..." : "Voice input command"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={isGenerating || (!inputText.trim() && attachments.length === 0)}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isGenerating 
                  ? "bg-white/5 text-gray-600 border border-white/5" 
                  : !inputText.trim() && attachments.length === 0
                  ? "text-gray-600 bg-transparent shrink-0" 
                  : `${getThemeButton()}`
              }`}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Footer Branding Line */}
      <div className="text-center py-2 text-[10px] text-gray-600 select-none tracking-widest uppercase font-mono mt-1">
        NEURON MEMBRANE SECURE PROXY v2.5 • WORKSPACE
      </div>
    </div>
  );
}
