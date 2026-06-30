import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Sparkles, 
  MessageSquare, 
  Mic, 
  MicOff, 
  User as UserIcon,
  Zap,
  Coffee,
  Calendar,
  CornerDownLeft,
  Plus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatAssistantView: React.FC = () => {
  const { 
    chatHistory, 
    sendChat, 
    isChatLoading,
    user
  } = useApp();

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isChatLoading) return;

    const textToSend = message;
    setMessage('');
    await sendChat(textToSend);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isChatLoading) return;
    await sendChat(prompt);
  };

  // Simulate voice dictation commands
  const handleVoiceCommand = () => {
    if (isChatLoading) return;
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    
    const voiceCommands = [
      "Add a biology assignment due tomorrow at 5 PM",
      "I'm tired, what should I do now?",
      "Can you rearrange my schedule to fit in 2 hours today?",
      "Move my exam prep slot to this evening",
      "What is my deadline risk for tomorrow?"
    ];

    // Pick a random voice command and simulate typing
    const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
    
    setTimeout(() => {
      setMessage(randomCommand);
      setIsRecording(false);
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* Companion Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">LastMinute Assistant</h3>
            <span className="text-[10px] text-emerald-600 font-bold block">● ONLINE</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">POWERED BY GEMINI 2.5 FLASH</span>
      </div>

      {/* Messages Scrolling Arena */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <MessageSquare className="w-12 h-12 text-slate-200" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Executive AI Companion</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                I can help you add tasks, rearrange schedules when you have tight hours, recommend easy work when tired, or sync events automatically.
              </p>
            </div>
            
            {/* Quick action prompts */}
            <div className="grid grid-cols-2 gap-2 w-full pt-4">
              <button 
                onClick={() => handleQuickPrompt("I'm tired, can you suggest easy tasks?")}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-[11px] text-slate-700 font-medium transition-all flex items-center space-x-1.5"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-500" />
                <span>"I'm tired"</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("I only have two free hours today, rearrange schedule")}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-[11px] text-slate-700 font-medium transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>"I only have 2 hours"</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("Add assignment tomorrow at 4 PM")}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-[11px] text-slate-700 font-medium transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500" />
                <span>"Add assignment"</span>
              </button>
              <button 
                onClick={() => handleQuickPrompt("What should I do right now?")}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-left border border-slate-200 text-[11px] text-slate-700 font-medium transition-all flex items-center space-x-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>"What to do now?"</span>
              </button>
            </div>
          </div>
        ) : (
          chatHistory.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex space-x-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isUser ? 'bg-blue-600' : 'bg-slate-800'}`}>
                  {isUser ? (
                    user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-2xl ${isUser ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                  {isUser ? (
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="text-xs leading-relaxed markdown-body">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}

                  {/* Render simulated execution badges */}
                  {!isUser && msg.actionSuggestion && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-blue-700 font-mono font-bold">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 fill-blue-100 text-blue-600" />
                        <span>PROACTIVE TRIGGER: {msg.actionSuggestion.type.toUpperCase()}</span>
                      </span>
                      <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Executed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing Loader */}
        {isChatLoading && (
          <div className="flex space-x-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-none">
              <div className="flex space-x-1.5 py-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic Recording Wave Banner if active */}
      {isRecording && (
        <div className="bg-rose-50 border-t border-rose-100 p-3.5 flex items-center justify-center space-x-3 text-xs text-rose-800 font-bold font-mono">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
          <span>Listening to dictation... Say "Add maths homework tomorrow"</span>
        </div>
      )}

      {/* Input Tray */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          
          {/* Voice Assitant trigger button */}
          <button 
            type="button"
            onClick={handleVoiceCommand}
            className={`p-2.5 rounded-xl border transition-all ${
              isRecording 
                ? 'bg-rose-100 border-rose-200 text-rose-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:text-blue-600'
            }`}
            title="Dictate voice command"
          >
            {isRecording ? <MicOff className="w-4.5 h-4.5 animate-pulse" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <div className="flex-1 relative flex items-center">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isRecording ? "Listening to voice..." : "Type custom request or trigger a command..."}
              disabled={isRecording || isChatLoading}
              className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-xs focus:outline-none focus:border-blue-500"
            />
            <span className="absolute right-3 text-[10px] text-slate-400 font-mono hidden sm:flex items-center space-x-1 pointer-events-none">
              <CornerDownLeft className="w-3 h-3" />
              <span>Enter</span>
            </span>
          </div>

          <button 
            type="submit"
            disabled={!message.trim() || isChatLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
