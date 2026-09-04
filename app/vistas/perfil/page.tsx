"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "../../../lib/firebase/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import {
  LogOut,
  LogIn,
  ChevronRight,
  User,
  MapPin,
  Droplets,
  Ruler,
  Weight,
  Calendar,
  Phone,
  Pill,
  AlertCircle,
  Accessibility,
  ArrowLeft,
  Trash2,
  X,
  ShieldAlert,
  Download,
  Upload,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import { ViewTutorialModal } from "@/components/ui/view-tutorial-modal";
import { motion, AnimatePresence } from "framer-motion";
import { remove } from "firebase/database";

const STORAGE_KEY = "amvi_patient_profile";

type PatientProfile = {
  nombre: string;
  edad: string;
  peso: string;
  estatura: string;
  genero: string;
  localidad: string;
  tipoSangre: string;
  discapacidad: string;
  medicacion: string;
  alergias: string;
  contactoEmergencia: string;
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load local profile
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch {}

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
          }
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/vistas/login");
  };

  const handleDeleteData = async () => {
    if (user) {
      // Clear Firebase data
      await remove(ref(db, `users/${user.uid}`));
    }
    // Clear localStorage
    localStorage.clear();
    setProfile(null);
    setShowDeleteConfirm(false);
    // Optionally logout too
    await signOut(auth);
    router.push("/vistas/login");
  };

  const handleExportData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const p: Record<string, string> = stored ? JSON.parse(stored) : {};

    const today = new Date().toLocaleDateString("es-MX", {
      year: "numeric", month: "long", day: "numeric",
    });

    const field = (label: string, value: string | undefined) =>
      value ? `<tr><td class="label">${label}</td><td class="value">${value}</td></tr>` : "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expediente Médico AMVI — ${p.nombres || "Paciente"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      /* Vibrant macOS-style mesh gradient background */
      background-color: #ffb7b2;
      background-image: 
        radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%),
        radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
        radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
        radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
        radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
        radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
        radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%);
      background-attachment: fixed; 
      color: #1d1d1f; 
      min-height: 100vh; 
      padding: 60px 20px; 
    }
    
    .page { 
      max-width: 800px; 
      margin: 0 auto; 
      /* Extreme liquid glass effect */
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%);
      backdrop-filter: blur(40px) saturate(250%); 
      -webkit-backdrop-filter: blur(40px) saturate(250%); 
      border: 1px solid rgba(255, 255, 255, 0.8); 
      border-radius: 40px; 
      overflow: hidden; 
      box-shadow: 
        0 24px 64px rgba(0,0,0,0.15), 
        inset 0 1px 0 rgba(255,255,255,1), 
        inset 0 -1px 0 rgba(255,255,255,0.2); 
    }
    
    .header { 
      padding: 48px 56px; 
      background: rgba(255, 255, 255, 0.3); 
      border-bottom: 1px solid rgba(255, 255, 255, 0.5); 
      box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.2);
    }
    
    .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    
    .logo { 
      font-size: 32px; 
      font-weight: 900; 
      letter-spacing: -1.5px; 
      background: linear-gradient(135deg, #000 0%, #434344 100%); 
      -webkit-background-clip: text; 
      -webkit-text-fill-color: transparent; 
      text-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .logo span { font-weight: 600; font-size: 14px; display: block; margin-top: 4px; letter-spacing: -0.2px; -webkit-text-fill-color: rgba(0,0,0,0.5); }
    
    .badge { 
      background: rgba(255, 255, 255, 0.6); 
      border: 1px solid rgba(255, 255, 255, 0.9); 
      color: #000; 
      padding: 8px 16px; 
      border-radius: 100px; 
      font-size: 11px; 
      font-weight: 800; 
      letter-spacing: 1.5px; 
      text-transform: uppercase; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    
    .patient-name { font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1px; }
    .patient-meta { color: rgba(0,0,0,0.6); font-size: 15px; font-weight: 600; letter-spacing: -0.2px;}
    
    .section { padding: 40px 56px; border-bottom: 1px solid rgba(255, 255, 255, 0.4); }
    .section:last-child { border-bottom: none; }
    
    .section-title { 
      font-size: 13px; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 2px; 
      color: rgba(0,0,0,0.4); 
      margin-bottom: 24px; 
      text-shadow: 0 1px 0 rgba(255,255,255,0.5);
    }
    
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
    tr:last-child { border-bottom: none; }
    td { padding: 18px 0; vertical-align: middle; }
    td.label { font-size: 14px; font-weight: 600; color: rgba(0,0,0,0.5); width: 40%; padding-right: 16px; }
    td.value { font-size: 16px; font-weight: 700; color: #1d1d1f; }
    
    .pills { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; }
    .pill { 
      background: rgba(255, 255, 255, 0.6); 
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8); 
      color: #1d1d1f; 
      font-size: 14px; 
      font-weight: 700; 
      padding: 10px 20px; 
      border-radius: 100px; 
      border: 1px solid rgba(255, 255, 255, 0.9); 
    }
    .pill.red { background: rgba(255, 59, 48, 0.15); color: #d70015; border-color: rgba(255, 59, 48, 0.3); }
    .pill.green { background: rgba(52, 199, 89, 0.15); color: #248a3d; border-color: rgba(52, 199, 89, 0.3); }
    
    .footer { 
      background: rgba(255, 255, 255, 0.2); 
      padding: 32px 56px; 
      text-align: center; 
      font-size: 13px; 
      color: rgba(0,0,0,0.5); 
      font-weight: 600; 
      border-top: 1px solid rgba(255, 255, 255, 0.5); 
    }
    
    .emergency-box { 
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 59, 48, 0.1) 100%); 
      border: 1px solid rgba(255, 59, 48, 0.3); 
      border-radius: 24px; 
      padding: 28px; 
      margin-top: 16px; 
      box-shadow: 0 12px 32px rgba(255, 59, 48, 0.1), inset 0 1px 0 rgba(255,255,255,1);
    }
    
    .emergency-title { color: #d70015; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; text-shadow: 0 1px 0 rgba(255,255,255,0.8); }
    .emergency-info { font-size: 22px; font-weight: 800; color: #1d1d1f; margin-bottom: 4px; }
    .emergency-phone { color: #d70015; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;}
    
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; margin: 0; border: none; border-radius: 0; backdrop-filter: none; -webkit-backdrop-filter: none; background: white; max-width: 100%; }
      .header { background: white; border-bottom: 2px solid #000; }
      .footer { background: white; border-top: 1px solid #ddd; }
      .emergency-box { background: #fffaf9; border: 1px solid #ff3b30; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-top">
        <div class="logo">AMVI<span>Asistente Médico Virtual Inteligente</span></div>
        <div class="badge">Expediente Médico</div>
      </div>
      <div class="patient-name">${p.nombres || "Paciente sin nombre"}</div>
      <div class="patient-meta">Generado el ${today} &nbsp;·&nbsp; Documento confidencial</div>
    </div>

    <div class="section">
      <div class="section-title">👤 Identificación</div>
      <table>
        ${field("CURP", p.curp)}
        ${field("Género", p.genero ? p.genero.charAt(0).toUpperCase() + p.genero.slice(1) : undefined)}
        ${field("Edad", p.edad ? p.edad + " años" : undefined)}
        ${field("Ocupación", p.ocupacion)}
        ${field("País", p.localidad)}
      </table>
    </div>

    <div class="section">
      <div class="section-title">📊 Métricas Corporales</div>
      <div class="pills">
        ${p.peso ? `<span class="pill">Peso: ${p.peso} kg</span>` : ""}
        ${p.estatura ? `<span class="pill">Estatura: ${p.estatura} cm</span>` : ""}
        ${p.tipoSangre ? `<span class="pill red">🩸 Sangre: ${p.tipoSangre}</span>` : ""}
        ${p.discapacidad ? `<span class="pill">Discapacidad: ${p.discapacidad}</span>` : ""}
      </div>
    </div>

    <div class="section">
      <div class="section-title">⚠️ Alergias y Medicación</div>
      <table>
        ${field("Alergias", p.alergias || "Ninguna conocida")}
        ${field("Medicación actual", p.medicacion || "Ninguna")}
      </table>
    </div>

    <div class="section">
      <div class="section-title">🧬 Antecedentes Clínicos (NOM-004)</div>
      <table>
        ${field("Antecedentes heredofamiliares", p.antecedentesHeredofamiliares)}
        ${field("Antecedentes patológicos", p.antecedentesPatologicos)}
        ${field("Hábitos de vida", p.habitosVida)}
      </table>
    </div>

    <div class="section">
      <div class="section-title">🚨 Contacto de Emergencia</div>
      <div class="emergency-box">
        <div class="emergency-title">📞 En caso de emergencia, contactar a:</div>
        <div class="emergency-info">${p.nombreContactoEmergencia || "No especificado"}</div>
        <div class="emergency-phone">${p.contactoEmergencia || "---"}</div>
      </div>
    </div>

    <div class="footer">
      Expediente generado por AMVI App · Este documento es confidencial y de uso médico exclusivo.
    </div>
  </div>

  <script>
    window.onload = () => window.print();
  <\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      // Fallback: download as HTML file
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expediente_medico_AMVI_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data === "object") {
          for (const key in data) {
            localStorage.setItem(key, data[key]);
          }
          alert("Datos importados con éxito. La aplicación se recargará.");
          window.location.reload();
        }
      } catch (err) {
        alert("El archivo no es válido o está dañado.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  const displayName = profile?.nombre || user?.displayName || "Usuario";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const infoItems = profile
    ? [
        { icon: Calendar, label: "Edad", value: profile.edad ? `${profile.edad} años` : null },
        { icon: Weight, label: "Peso", value: profile.peso ? `${profile.peso} kg` : null },
        { icon: Ruler, label: "Estatura", value: profile.estatura ? `${profile.estatura} cm` : null },
        { icon: User, label: "Género", value: profile.genero ? profile.genero.charAt(0).toUpperCase() + profile.genero.slice(1) : null },
        { icon: MapPin, label: "Localidad", value: profile.localidad || null },
        { icon: Droplets, label: "Tipo de sangre", value: profile.tipoSangre || null },
        { icon: Accessibility, label: "Discapacidad", value: profile.discapacidad || null },
        { icon: Pill, label: "Medicación", value: profile.medicacion || null },
        { icon: AlertCircle, label: "Alergias", value: profile.alergias || null },
        { icon: Phone, label: "Contacto emergencia", value: profile.contactoEmergencia || null },
      ].filter((item) => item.value && item.value !== "N/A")
    : [];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-24 pb-20 transition-colors duration-500">
      <ViewTutorialModal 
        viewId="perfil"
        title="Tu Perfil Médico"
        description="Aquí puedes ver un resumen de tu información de salud, gestionar tu sesión y acceder rápidamente a la edición de tus datos."
      />
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#3345CC] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Inicio
          </Link>
        </div>
        <ThemeToggle />
      </header>

      <div className="mx-auto max-w-lg px-6">

        {/* Avatar & Name Card */}
        <div className="mb-6 flex flex-col items-center rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          {/* Avatar */}
          {user?.photoURL ? (
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 dark:border-white/10 shadow-md">
              <img
                src={user.photoURL}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#3649cc] text-3xl font-bold text-white shadow-md shadow-[#3649cc]/20">
              {initials || "U"}
            </div>
          )}

          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.email || "Sin cuenta vinculada"}
          </p>


        </div>

        {/* Profile Data */}
        {infoItems.length > 0 ? (
          <div className="mb-6 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 pt-5 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#3649cc]">
                Datos de salud
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {infoItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 text-slate-600 dark:text-slate-300 shadow-sm border border-white/50 dark:border-white/10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/40 dark:bg-white/5 blur-sm rounded-full scale-150 -translate-y-1/2"></div>
                      <Icon className="h-5 w-5 relative z-10 stroke-[2]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-900/50 p-8 text-center">
            <p className="text-sm text-slate-500">
              Aún no has capturado tus datos de salud.
            </p>
            <Link
              href="/vistas/captura-datos"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#3649cc] hover:underline"
            >
              Capturar datos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-6 rounded-3xl border border-slate-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <Link
            href="/vistas/captura-datos"
            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3649cc]/10 text-[#3649cc]">
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">Ver mis datos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
          </Link>

          {!user ? (
            <Link
              href="/vistas/login"
              className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <LogIn className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold">Iniciar sesión</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
            </Link>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400">
                  <LogOut className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">Cerrar sesión</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">Borrar mis datos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
          </button>

          <button
            onClick={handleExportData}
            className="flex w-full items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Download className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Exportar Expediente Médico (PDF)</span>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
          </button>

          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportData} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              title="Importar datos locales"
            />
            <div className="flex w-full items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Importar datos locales</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 dark:text-white/20" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 pt-4 pb-12">
          <div className="relative h-4 w-4 overflow-hidden opacity-50">
            <Image src="/logo.png" alt="" fill sizes="16px" className="object-contain" />
          </div>
          <span>AMVI v0.1.0</span>
        </div>
      </div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">¿Cerrar sesión?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  Tendrás que volver a ingresar tus credenciales para acceder a tu historial de salud.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
                  >
                    Confirmar Salida
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Data Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
            >
              <div className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/40">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">¿Borrar todos tus datos?</h3>
                <p className="text-sm text-on-surface-variant mb-8">
                  Esta acción es <span className="font-bold text-red-600">irreversible</span>. Se eliminará tu historial, padecimientos y configuración local y en la nube.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDeleteData}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
                  >
                    Borrar Permanentemente
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                  >
                    Mantener mis datos
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
