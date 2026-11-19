import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  ShieldCheck,
  Info,
  Clock,
  User,
  Bot,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const AlfredView: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showVoiceDisclosure, setShowVoiceDisclosure] = useState(false);

  const suggestions = [
    "What are my top priorities for today?",
    "Give me an honest summary of my finances this month",
    "How are my habit streaks holding up?",
    "Suggest a daily evening journal prompt",
  ];

  const handleVoiceToggle = () => {
    if (!isVoiceActive) {
      setShowVoiceDisclosure(true);
    } else {
      setIsVoiceActive(false);
    }
  };

  const handleConfirmVoice = () => {
    setShowVoiceDisclosure(false);
    setIsVoiceActive(true);
    // In Sprint 5, Web Speech API will be actively bound here
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    alert(`Message submitted: "${inputMessage.trim()}". Full local chat session persistence will be connected in Sprint 4.`);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-boundary shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-content-primary">
              Alfred Assistant
            </h1>
            <p className="text-xs text-content-secondary">
              Local assistant & decision support interface
            </p>
          </div>
        </div>

        <Badge variant="success">100% Local Device</Badge>
      </div>

      {/* Privacy & Vendor Disclosure Callout */}
      <div className="bg-bg-elevated border border-boundary rounded-lg p-3 text-xs text-content-secondary space-y-1 shrink-0">
        <div className="flex items-center gap-1.5 font-semibold text-content-primary">
          <ShieldCheck size={14} className="text-status-success" />
          <span>Local Privacy & Cloud Decoupling</span>
        </div>
        <p className="text-[11px] text-content-muted leading-relaxed">
          Chat sessions are stored strictly in your browser's IndexedDB. External AI cloud integration is completely optional and disabled by default.
        </p>
      </div>

      {/* Voice Vendor Disclosure Modal */}
      {showVoiceDisclosure && (
        <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-3 text-xs text-content-primary space-y-2 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-status-warning">
            <Info size={14} />
            <span>Browser Speech Recognition Notice</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-relaxed">
            Speech recognition uses your browser's Web Speech API. Depending on your browser (e.g., Google Chrome), audio clips may be processed by vendor cloud servers for transcription. Text input remains 100% offline.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => setShowVoiceDisclosure(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirmVoice}>
              I Understand & Enable Voice
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 bg-bg-secondary/40 border border-boundary rounded-lg p-4 overflow-y-auto space-y-4">
        {/* Welcome Message */}
        <div className="flex items-start gap-3 max-w-xl">
          <div className="w-7 h-7 rounded-full bg-accent-primary text-white flex items-center justify-center shrink-0">
            <Bot size={15} />
          </div>
          <div className="bg-bg-elevated border border-boundary p-3.5 rounded-lg text-xs space-y-2">
            <p className="font-semibold text-content-primary">
              Hello! I am Alfred, your local life assistant.
            </p>
            <p className="text-content-secondary leading-relaxed">
              I analyze your stored finances, upcoming tasks, and habit streaks strictly on this device. How can I help you today?
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="pt-4">
          <span className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-2">
            Quick Queries
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => setInputMessage(sug)}
                className="text-xs px-3 py-1.5 rounded-md bg-bg-elevated hover:bg-bg-secondary border border-boundary text-content-primary transition-colors text-left"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Alfred anything or type a prompt..."
          className="flex-1 px-4 py-2.5 rounded-md bg-bg-secondary border border-boundary text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-accent-primary"
        />

        {/* Voice Toggle */}
        <button
          type="button"
          onClick={handleVoiceToggle}
          title={isVoiceActive ? 'Voice recognition listening' : 'Enable optional speech input'}
          className={`p-2.5 rounded-md border transition-colors ${
            isVoiceActive
              ? 'bg-status-error/15 border-status-error/40 text-status-error animate-pulse'
              : 'bg-bg-secondary border-boundary text-content-secondary hover:text-content-primary'
          }`}
        >
          {isVoiceActive ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          icon={<Send size={16} />}
          disabled={!inputMessage.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
