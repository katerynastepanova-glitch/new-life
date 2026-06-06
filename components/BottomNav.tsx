"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Capture",
    icon: (on: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={on ? "#6366f1" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    href: "/inbox",
    label: "Inbox",
    icon: (on: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={on ? "#6366f1" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
      </svg>
    ),
  },
  {
    href: "/today",
    label: "Today",
    icon: (on: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={on ? "#6366f1" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-bottom z-50"
      style={{ background: "#111", borderTop: "1px solid #2a2a2a" }}>
      <div className="flex">
        {tabs.map(({ href, label, icon }) => {
          const on = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className="flex flex-col items-center justify-center flex-1 py-3 gap-1 select-none"
              style={{ minHeight: 64 }}>
              {icon(on)}
              <span className="text-xs font-medium" style={{ color: on ? "#6366f1" : "#6b7280" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
