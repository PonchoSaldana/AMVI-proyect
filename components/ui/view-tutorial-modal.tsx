"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface ViewTutorialModalProps {
  viewId: string;
  title: string;
  description: string;
}

export function ViewTutorialModal({ viewId, title, description }: ViewTutorialModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storageKey = `amvi_hide_tutorial_${viewId}`;
    const hideTutorial = localStorage.getItem(storageKey);
    if (!hideTutorial) {
      setIsOpen(true);
    }
  }, [viewId]);

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem(`amvi_hide_tutorial_${viewId}`, "true");
    }
    setIsOpen(false);
  };

  if (!isMounted || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
        {/* Deep Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
        />
        
        {/* Liquid Glass Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md rounded-[2.5rem] p-8 shadow-[0_0_80px_-20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_80px_-20px_rgba(99,102,241,0.2)] overflow-hidden"
        >
          {/* Liquid Glass Base */}
          <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/40 backdrop-blur-[40px] border-[1.5px] border-white/60 dark:border-white/10" />
          
          {/* Inner Highlights / Specular reflections */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/5 to-transparent dark:from-white/10 dark:via-transparent dark:to-black/40 pointer-events-none" />
          
          {/* Liquid Glows */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/30 dark:bg-blue-600/20 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-500/30 dark:bg-purple-600/20 rounded-full blur-[60px] pointer-events-none" />
          
          <div className="relative flex flex-col items-center text-center space-y-6 z-10">
            
            {/* Liquid Icon Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-30 dark:opacity-40 rounded-full" />
              <div className="relative w-16 h-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/80 dark:border-white/20 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_4px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] rotate-3">
                <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-300 -rotate-3 drop-shadow-sm" />
              </div>
            </div>
            
            {/* Typography */}
            <div className="space-y-3 px-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white drop-shadow-sm leading-tight">
                {title}
              </h2>
              <p className="text-[15px] font-medium text-slate-600 dark:text-slate-300/90 leading-relaxed drop-shadow-sm">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="w-full pt-6 space-y-5">
              <button 
                onClick={handleContinue}
                className="w-full relative group overflow-hidden rounded-2xl active:scale-[0.98] transition-all"
              >
                {/* Liquid Glass Button */}
                <div className="absolute inset-0 bg-blue-600/80 dark:bg-indigo-600/80 backdrop-blur-md border border-white/30 shadow-[inset_0_1px_4px_rgba(255,255,255,0.3)] transition-colors group-hover:bg-blue-500/80 dark:group-hover:bg-indigo-500/80" />
                
                {/* Button specular highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                
                <div className="relative px-6 py-4 flex items-center justify-center">
                  <span className="font-bold text-white text-base drop-shadow-md">
                    Entendido, Continuar
                  </span>
                </div>
              </button>

              <label className="flex items-center justify-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-white/20 dark:hover:bg-white/5 transition-colors backdrop-blur-sm">
                <div className={`relative flex items-center justify-center w-5 h-5 rounded-[6px] border-2 transition-all duration-200 backdrop-blur-md shadow-sm ${dontShowAgain ? 'bg-blue-600/80 border-blue-500 dark:border-blue-400' : 'bg-white/40 dark:bg-slate-800/40 border-white/80 dark:border-slate-500/50 group-hover:border-blue-500/80'}`}>
                  <input 
                    type="checkbox" 
                    className="absolute opacity-0 cursor-pointer w-full h-full"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                  />
                  <CheckIcon className={`w-3.5 h-3.5 text-white drop-shadow-md transition-transform duration-200 ${dontShowAgain ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors select-none drop-shadow-sm">
                  No volver a mostrar en esta sección
                </span>
              </label>
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
