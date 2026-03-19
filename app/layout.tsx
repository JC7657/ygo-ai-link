import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AiAssistant } from "@/components/AiAssistant";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-card",
});

export const metadata: Metadata = {
  title: "YGO Ignis Project",
  description: "Yu-Gi-Oh! card database with AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${spaceGrotesk.variable} bg-gray-900 text-gray-100 min-h-screen`}>
        <Providers>
          <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex items-center justify-between">
                <a href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  YGO Ignis Project
                </a>
              </nav>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}
