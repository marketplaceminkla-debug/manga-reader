"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setProgress(100);
      const t = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
      prevPath.current = pathname;
      return () => clearTimeout(t);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || target.target === "_blank") return;

      setVisible(true);
      setProgress(15);

      let p = 15;
      const interval = setInterval(() => {
        p += Math.random() * 15;
        if (p >= 85) { clearInterval(interval); p = 85; }
        setProgress(p);
      }, 200);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = interval;
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      style={{ background: "rgba(124,58,237,0.15)" }}
    >
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #7C3AED, #FB7185)",
          opacity: visible ? 1 : 0,
          transition: progress === 100
            ? "width 0.15s ease-out, opacity 0.3s ease 0.15s"
            : "width 0.3s ease-out",
          boxShadow: "0 0 10px rgba(124,58,237,0.7)",
        }}
      />
    </div>
  );
}
