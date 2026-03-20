import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AiAssistant } from "@/components/AiAssistant";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-card",
});

export const metadata: Metadata = {
  title: "YGO Ai Link",
  description: "Yu-Gi-Oh! card database with AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${spaceGrotesk.variable} min-h-screen`}>
        <Providers>
          <header className="sticky top-0 z-30 bg-gradient-to-r from-purple-950 via-purple-900 to-purple-950 border-b border-purple-800/50 shadow-lg shadow-purple-900/20">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-center">
                <a href="/" className="transition-transform hover:scale-105 duration-300">
                  <Image
                    src="/assets/Ai_Link_logo.png"
                    alt="YGO Ai Link Logo"
                    width={350}
                    height={80}
                    className="h-20 w-auto brightness-125 contrast-125"
                    priority
                  />
                </a>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </main>
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}
