import { useEffect } from "react";

export function useViewportHeight() {
  useEffect(() => {
    const fixViewportHeight = () => {
      document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
    };
    fixViewportHeight();
    window.addEventListener("resize", fixViewportHeight);
    return () => window.removeEventListener("resize", fixViewportHeight);
  }, []);
}
