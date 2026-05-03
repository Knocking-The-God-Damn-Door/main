import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNOCK — Threshold",
  description:
    "1973. Bob Dylan writes a door. The door is waiting for you. But not every knock is enough.",
  keywords: ["knock", "bob dylan", "1973", "threshold", "ai", "chatbot"],
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        {/* Flicker layer — sits above the entire page */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 4px)",
          }}
        />

        {/* Amber light source — top-left corner, as if a lamp is burning */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-32 -left-32 z-0 h-96 w-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)",
          }}
        />

        <main className="relative z-10 min-h-screen">{children}</main>

        {/* Bottom signature — 1973 */}
        <footer
          className="fixed bottom-2 right-4 z-40 select-none font-mono text-xs opacity-20"
          style={{ color: "var(--color-dust)", letterSpacing: "0.2em" }}
        >
          1973
        </footer>
      </body>
    </html>
  );
}
