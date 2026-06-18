import React from "react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_architect-pro-10/artifacts/91s3fe3b_LOGO%20-%20CAD%20Vector%20Model.png";

export const Logo = ({ className = "", dark = false, size = "md", showWordmark = false }) => {
  const sizes = {
    sm: { mark: "h-9", text: "text-sm", tag: "0.55rem" },
    md: { mark: "h-12", text: "text-base", tag: "0.55rem" },
    lg: { mark: "h-16", text: "text-lg", tag: "0.6rem" },
    xl: { mark: "h-24", text: "text-2xl", tag: "0.65rem" },
  };
  const s = sizes[size] || sizes.md;
  const color = dark ? "text-stone-50" : "text-stone-900";
  const subColor = dark ? "text-stone-300" : "text-stone-500";

  return (
    <div className={`flex items-center gap-3 group ${className}`} data-testid="brand-logo">
      <img
        src={LOGO_URL}
        alt="Studio Inai"
        className={`${s.mark} w-auto select-none transition-all duration-500 group-hover:scale-105`}
        style={{
          // On dark hero: blend so only the white "studio inai" text shows — elegant, no heavy black blob.
          // On light: normal display with subtle shadow.
          mixBlendMode: dark ? "screen" : "normal",
          filter: dark
            ? "drop-shadow(0 2px 18px rgba(255,255,255,0.08))"
            : "drop-shadow(0 1px 6px rgba(28,25,23,0.08))",
        }}
        draggable="false"
      />
      {showWordmark && (
        <div className={`leading-none ${color} hidden sm:block`}>
          <div
            className={`font-serif ${s.text} tracking-tight`}
            style={{ fontVariationSettings: '"opsz" 96' }}
          >
            studio inai
          </div>
          <div
            className={`overline mt-1 ${subColor}`}
            style={{ fontSize: s.tag, letterSpacing: "0.28em" }}
          >
            ARCHITECTURE · INTERIORS
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
