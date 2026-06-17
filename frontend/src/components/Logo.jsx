import React from "react";

export const Logo = ({ className = "", dark = false, size = "md" }) => {
  const sizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };
  const color = dark ? "text-stone-50" : "text-stone-900";
  return (
    <div
      className={`flex items-center gap-2.5 ${className}`}
      data-testid="brand-logo"
    >
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth="1.4" className={color} />
        <path d="M2 22 L16 8 L30 22" stroke="currentColor" strokeWidth="1.4" fill="none" className={color} />
        <circle cx="16" cy="22" r="1.4" fill="currentColor" className={color} />
      </svg>
      <div className={`leading-none ${color}`}>
        <div className={`font-serif ${sizes[size]} tracking-wide`}>STUDIO INAI</div>
        <div className="overline mt-0.5 opacity-70" style={{ fontSize: "0.55rem" }}>
          ARCHITECTURE · INTERIORS
        </div>
      </div>
    </div>
  );
};

export default Logo;
