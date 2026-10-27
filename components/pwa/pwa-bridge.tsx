"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function PwaBridge() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* o app continua funcionando sem o cache offline */
      });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="no-print fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-start gap-2.5 rounded-xl border border-marigold/40 bg-marigold-soft px-4 py-3 text-[13px] font-medium text-[#6d4f10] shadow-lg lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
      role="status"
    >
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Você está sem internet. As telas já abertas continuam visíveis, mas salvar e atualizar
        precisam de conexão.
      </span>
    </div>
  );
}
