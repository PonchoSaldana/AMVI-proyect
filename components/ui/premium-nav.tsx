"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  HeartIcon, 
  UserIcon,
  BellIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { icon: HomeIcon, href: "/", label: "Inicio" },
  { icon: BellIcon, href: "/vistas/recordatorios", label: "Recordatorios" },
  { icon: HeartIcon, href: "/vistas/registro-salud", label: "Salud" },
  { icon: UserIcon, href: "/vistas/perfil", label: "Perfil" },
];

export function PremiumNav() {
  const pathname = usePathname();

  if (pathname === "/vistas/login") return null;

  return (
    <nav className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <div className="liquid-glass-heavy rounded-[2rem] px-2 h-16 flex items-center justify-around pointer-events-auto w-full max-w-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                className="flex flex-col items-center gap-1"
              >
                <item.icon className={cn(
                  "w-6 h-6 transition-all duration-300", 
                  isActive ? "stroke-[2.5]" : "stroke-[1.5] opacity-70",
                )} />
                
                <span className={cn(
                  "text-[10px] font-bold transition-all duration-300",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-90 h-0 overflow-hidden"
                )}>
                  {item.label}
                </span>
              </motion.div>
              
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 -z-10 rounded-[1.5rem] m-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
