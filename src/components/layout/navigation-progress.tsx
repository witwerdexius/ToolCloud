"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type State = "idle" | "loading" | "completing";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("idle");
  // Track the path at the time loading started to avoid false completions
  const loadingFromPath = useRef<string | null>(null);

  // Intercept all anchor clicks to detect navigations
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor || !anchor.href) return;
      // Skip modifier-key clicks (new tab etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const currentPath = window.location.pathname + window.location.search;
        const targetPath = url.pathname + url.search;
        if (targetPath === currentPath) return;
        loadingFromPath.current = currentPath;
        setState("loading");
      } catch {
        // ignore invalid URLs
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Complete when pathname/searchParams change (navigation finished)
  useEffect(() => {
    setState((s) => (s === "loading" ? "completing" : s));
  }, [pathname, searchParams]);

  // Reset after completion animation
  useEffect(() => {
    if (state !== "completing") return;
    const timer = setTimeout(() => {
      setState("idle");
      loadingFromPath.current = null;
    }, 350);
    return () => clearTimeout(timer);
  }, [state]);

  if (state === "idle") return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div className={state === "loading" ? "tc-nav-bar-loading" : "tc-nav-bar-completing"} />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense>
      <NavigationProgressInner />
    </Suspense>
  );
}
