"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };

    updateClock(); // inicializa imediatamente
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval); // limpa o intervalo ao desmontar
  }, []);

  return (
    <div style={{ fontSize: "14px", fontFamily: "monospace", color: "#555" }}>
      {time}
    </div>
  );
}
