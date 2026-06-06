import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TasksProvider } from "@/components/TasksContext";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "New Life Planner",
  description: "Capture thoughts, get structured tasks",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <TasksProvider>
          <main className="safe-top" style={{ minHeight: "100dvh", paddingBottom: 80, background: "#0f0f0f" }}>
            {children}
          </main>
          <BottomNav />
        </TasksProvider>
      </body>
    </html>
  );
}
