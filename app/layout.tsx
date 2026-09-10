import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Public_Sans, Manrope, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { PremiumNav } from "@/components/ui/premium-nav";
import { AuthGuard } from "@/components/auth-guard";
import { Footer } from "@/components/ui/footer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PushNotificationManager } from "@/components/push-notification-manager";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const publicSans = Public_Sans({subsets:['latin'],variable:'--font-public-sans'});
const manrope = Manrope({subsets:['latin'],variable:'--font-manrope'});
const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-space-grotesk'});
const jakarta = Plus_Jakarta_Sans({subsets:['latin'],variable:'--font-jakarta'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AMVI",
  description: "Asistente Médico Virtual Inteligente",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AMVI",
  },
};

export const viewport = {
  themeColor: "#3649cc",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        publicSans.variable,
        manrope.variable,
        spaceGrotesk.variable
      )}
    >
      <body className={cn("min-h-screen flex flex-col font-jakarta bg-slate-50 dark:bg-black text-black dark:text-white transition-colors duration-300", jakarta.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Animated Liquid Background Layer */}
          <div className="fixed inset-0 z-[-10] w-full h-full overflow-hidden pointer-events-none bg-slate-50/80 dark:bg-[#020205] transition-colors duration-500">
            {/* Primary glowing blob */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 md:w-[600px] md:h-[600px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] md:blur-[140px] opacity-80 animate-blob"></div>
            {/* Secondary glowing blob */}
            <div className="absolute top-[20%] right-[-10%] w-72 h-72 md:w-[500px] md:h-[500px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] md:blur-[140px] opacity-80 animate-blob animation-delay-2000"></div>
            {/* Tertiary glowing blob */}
            <div className="absolute bottom-[-20%] left-[20%] w-72 h-72 md:w-[600px] md:h-[600px] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] md:blur-[140px] opacity-80 animate-blob animation-delay-4000"></div>
          </div>
          
          <AuthGuard>
            <div className="flex-1 flex flex-col">
              {children}
              <Footer />
            </div>
            <PremiumNav />
            <PWAInstallPrompt />
            <PushNotificationManager />
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
