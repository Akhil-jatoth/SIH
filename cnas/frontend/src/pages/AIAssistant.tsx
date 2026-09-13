import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  ChevronRight,
  RotateCcw,
  Network
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassPanel } from '../components/GlassPanel';
import { HumanInTheLoopBanner } from '../components/HumanInTheLoopBanner';
import { api } from '../services/api';
import { AssistantResponse, Entity } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: string;
  suggestedEntities?: number[];
  timestamp: string;
}

export const AIAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "👋 **Welcome to the CNAS Intelligence Copilot.**\n\nI can assist you with natural-language graph queries, suspect linkage paths, high-centrality kingpins, and cross-case intelligence analysis.\n\n*How can I assist your investigation today?*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [allNodes, setAllNodes] = useState<Record<number, Entity>>({});

  useEffect(() => {
    api.getFullGraph().then((data) => {
      const map: Record<number, Entity> = {};
      data.nodes.forEach((n) => {
        map[n.id] = n;
      });
      setAllNodes(map);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setInputQuery(q);
      handleSend(q);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res: AssistantResponse = await api.queryAssistant(q);
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        intent: res.intent,
        suggestedEntities: res.suggested_entities,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "⚠ Failed to connect to the intelligence query endpoint. Please verify backend connectivity.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "Who is connected to Rahul Verma?",
    "Shortest path between Kabir Khan and Priya Sharma",
    "Show key entities",
    "Find related cases to Operation Iron Grid",
    "Show anomalies",
    "Events near Delhi",
  ];

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto">
      <HumanInTheLoopBanner />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-glowPurple">
            <Bot className="w-6 h-6 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2 font-display">
              AI Natural-Language Investigation Copilot
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                INTENT ENGINE v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Query cross-cell criminal networks, communication paths, and anomalous clusters in plain English.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'init-1',
                sender: 'assistant',
                text: "Conversation reset. What investigation query would you like to run next?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          title="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Container */}
      <GlassPanel glow="violet" className="p-6 h-[580px] flex flex-col justify-between relative shadow-glowViolet">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-violet-400/20 border border-violet-400/40 flex items-center justify-center text-violet-200 flex-shrink-0 mt-0.5 shadow-glowViolet">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {/* Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none shadow-md font-normal border border-sky-400/30'
                        : 'glass-panel bg-slate-900/90 border border-slate-800 text-slate-100 rounded-bl-none font-normal shadow-ops backdrop-blur-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Render Clickable Entity Chips */}
                    {m.suggestedEntities && m.suggestedEntities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800">
                        <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-bold">
                          <Network className="w-3 h-3 text-sky-400" />
                          <span>Graph Quick-Links:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.suggestedEntities.map((entId) => {
                            const ent = allNodes[entId];
                            const label = ent ? `${ent.name} (${ent.type})` : `Entity #${entId}`;
                            return (
                              <button
                                key={entId}
                                onClick={() => navigate(`/graph?highlight=${entId}`)}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/40 transition-all cursor-pointer shadow-xs"
                              >
                                <span>{label}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 mt-1 font-mono px-1">
                    {m.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-sky-200 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-sky-200 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span className="font-mono">Analyzing knowledge graph topology...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & Example Chips */}
        <div className="pt-3 border-t border-slate-800 mt-3">
          {/* Example Question Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-[10px] text-slate-400 font-mono font-bold self-center mr-1">
              Sample queries:
            </span>
            {exampleQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer backdrop-blur-sm"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about connections, kingpins, paths, or anomalies (e.g., 'Who is connected to Rahul Verma?')..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 placeholder:text-slate-500 backdrop-blur-md"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glowViolet border border-violet-300/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Query</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </GlassPanel>
    </div>
  );
};
