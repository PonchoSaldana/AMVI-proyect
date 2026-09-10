"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, AlertTriangle, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AMVIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem("amvi_patient_profile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));
    } catch {}

    const accepted = localStorage.getItem("amvi-chat-warning-accepted");
    if (accepted === "true") setHasAcceptedWarning(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const toggleChat = () => {
    if (!isOpen && !hasAcceptedWarning) setShowWarning(true);
    setIsOpen(!isOpen);
  };

  const acceptWarning = () => {
    localStorage.setItem("amvi-chat-warning-accepted", "true");
    setHasAcceptedWarning(true);
    setShowWarning(false);
    if (history.length === 0) {
      setHistory([
        { role: "assistant", content: `¡Hola${profile.nombre ? " " + profile.nombre : ""}! Soy AMVI. ¿En qué te puedo ayudar hoy con tu salud?` },
      ]);
    }
  };

  const cancelWarning = () => {
    setShowWarning(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && hasAcceptedWarning && history.length === 0) {
      setHistory([
        { role: "assistant", content: `¡Hola${profile.nombre ? " " + profile.nombre : ""}! Soy AMVI. ¿En qué te puedo ayudar hoy con tu salud?` },
      ]);
    }
  }, [isOpen, hasAcceptedWarning, history.length, profile.nombre]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    const newHistory = [...history, { role: "user" as const, content: userMessage }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/deepseek/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: history.slice(-6), profile }),
      });
      const data = await res.json();
      setHistory([
        ...newHistory,
        { role: "assistant", content: data.reply || "Lo siento, tuve un problema al procesar tu solicitud." },
      ]);
    } catch {
      setHistory([...newHistory, { role: "assistant", content: "Lo siento, hay un error de conexión." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat trigger + window */}
      <div className="fixed bottom-28 md:bottom-6 right-5 z-[100]">
        <AnimatePresence>
          {isOpen && !showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 340, damping: 30 }}
              className="absolute bottom-20 right-0 w-[340px] sm:w-[390px] h-[540px] max-h-[82vh] flex flex-col overflow-hidden rounded-[2rem]"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                border: "1.5px solid rgba(255,255,255,0.45)",
                boxShadow:
                  "0 0 0 0.5px rgba(255,255,255,0.2) inset, 0 2px 0 rgba(255,255,255,0.5) inset, 0 24px 60px rgba(54,73,204,0.18), 0 4px 20px rgba(0,0,0,0.12)",
              }}
            >
              {/* ── Header ─────────────────────────────── */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(54,73,204,0.85) 0%, rgba(99,102,241,0.80) 100%)",
                  backdropFilter: "blur(20px)",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.15) inset",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with glow */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      border: "1.5px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 0 14px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.4)",
                    }}
                  >
                    <img src="/icon.png" alt="AMVI" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">AMVI Health Assistant</h3>
                    <p className="text-[10px] text-white/75 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                      En línea
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white/20 active:scale-90"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* ── Messages ───────────────────────────── */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ background: "rgba(248,250,255,0.06)" }}
              >
                {history.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 rounded-full mr-2 mt-1 flex items-center justify-center shrink-0 self-end"
                        style={{
                          background: "rgba(54,73,204,0.2)",
                          border: "1px solid rgba(54,73,204,0.3)",
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-[1.4rem] px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background: "linear-gradient(135deg, rgba(54,73,204,0.9) 0%, rgba(99,102,241,0.85) 100%)",
                              color: "#fff",
                              border: "1px solid rgba(255,255,255,0.25)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 12px rgba(54,73,204,0.3)",
                            }
                          : {
                              background: "rgba(255,255,255,0.55)",
                              backdropFilter: "blur(20px)",
                              WebkitBackdropFilter: "blur(20px)",
                              color: "#1e2040",
                              border: "1px solid rgba(255,255,255,0.6)",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(0,0,0,0.06)",
                            }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start items-end gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(54,73,204,0.2)",
                        border: "1px solid rgba(54,73,204,0.3)",
                      }}
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                    </div>
                    <div
                      className="rounded-[1.4rem] rounded-bl-sm px-5 py-3 flex items-center gap-1.5"
                      style={{
                        background: "rgba(255,255,255,0.55)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      {[0, 0.18, 0.36].map((delay, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full animate-bounce"
                          style={{
                            animationDelay: `${delay}s`,
                            background: "linear-gradient(135deg, #3649cc, #6366f1)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* ── Input bar ──────────────────────────── */}
              <div
                className="px-4 py-3 shrink-0"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(20px)",
                  borderTop: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 -1px 0 rgba(255,255,255,0.1) inset",
                }}
              >
                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu consulta médica..."
                    className="flex-1 h-11 rounded-full px-5 text-sm outline-none transition-all dark:text-white placeholder:text-slate-400"
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      backdropFilter: "blur(12px)",
                      border: "1.5px solid rgba(255,255,255,0.7)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset",
                      color: "#1e2040",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(54,73,204,0.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.7)")}
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || isLoading}
                    className="w-11 h-11 text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-all shrink-0 active:scale-90 hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #3649cc 0%, #6366f1 100%)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 14px rgba(54,73,204,0.45)",
                    }}
                  >
                    <Send className="w-4 h-4 -ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAB button ───────────────────────────── */}
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 text-white rounded-full flex items-center justify-center relative z-10"
          style={{
            background: "linear-gradient(135deg, #3649cc 0%, #6366f1 100%)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 30px rgba(54,73,204,0.5), 0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen && !showWarning ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Warning modal ────────────────────────── */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30"
              style={{ backdropFilter: "blur(16px)" }}
              onClick={cancelWarning}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-md rounded-[2rem] p-8"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(40px) saturate(200%)",
                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                border: "1.5px solid rgba(255,255,255,0.8)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9), 0 24px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(54,73,204,0.12)",
              }}
            >
              {/* Warning icon */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(245,158,11,0.15)",
                    border: "1.5px solid rgba(245,158,11,0.4)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 14px rgba(245,158,11,0.2)",
                  }}
                >
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
              </div>

              <h2 className="text-xl font-black text-center mb-3 text-slate-900">Aviso Importante</h2>
              <p className="text-slate-600 text-sm mb-7 text-center leading-relaxed">
                La IA puede cometer errores. En caso de presentar síntomas graves, visita a tu médico más cercano.
                <br /><br />
                <strong className="text-[#3649cc] font-bold">AMVI</strong> está para apoyarte con consultas sobre medicamentos, enfermedades y hábitos saludables, pero{" "}
                <strong className="text-rose-500 font-bold">no es capaz de diagnosticar formalmente</strong>.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={cancelWarning}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 transition-all active:scale-95"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: "1.5px solid rgba(0,0,0,0.08)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={acceptWarning}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #3649cc 0%, #6366f1 100%)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 14px rgba(54,73,204,0.4)",
                  }}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
