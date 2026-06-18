import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import api from "@/lib/api";

export default function WhatsAppButton() {
  const [num, setNum] = useState("");

  useEffect(() => {
    api.get("/content").then((r) => setNum(r.data?.contact_whatsapp || ""));
  }, []);

  if (!num) return null;
  const href = `https://wa.me/91${num.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello Studio Inai, I'd like to enquire about a project."
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      data-testid="whatsapp-fab"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-3"
    >
      <span className="hidden md:inline-flex font-display text-xs uppercase tracking-widest bg-stone-900 text-stone-50 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mr-1">
        Chat with us
      </span>
      <span className="w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-lg shadow-stone-900/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
        <MessageCircle size={26} fill="white" strokeWidth={0} />
      </span>
    </a>
  );
}
