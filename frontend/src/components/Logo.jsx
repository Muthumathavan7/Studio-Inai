import React from "react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_architect-pro-10/artifacts/91s3fe3b_LOGO%20-%20CAD%20Vector%20Model.png";

export const Logo = ({ className = "", dark = false, size = "md" }) => {
  const sizes = {
    sm: { box: "w-9 h-9", text: "text-sm", tag: "0.55rem" },
    md: { box: "w-11 h-11", text: "text-base", tag: "0.55rem" },
    lg: { box: "w-14 h-14", text: "text-lg", tag: "0.6rem" },
  };
  const s = sizes[size] || sizes.md;
  const color = dark ? "text-stone-50" : "text-stone-900";
  const subColor = dark ? "text-stone-400" : "text-stone-500";

  return (
    <div className={`flex items-center gap-3 ${className}`} data-testid="brand-logo">
      <div className={`${s.box} rounded-full overflow-hidden bg-stone-900 shrink-0 ring-1 ring-stone-200/40`}>
        <img src={LOGO_URL} alt="Studio Inai" className="w-full h-full object-cover" />
      </div>
      <div className={`leading-none ${color}`}>
        <div className={`font-serif ${s.text} tracking-tight`} style={{ fontVariationSettings: '"opsz" 96' }}>
          studio inai
        </div>
        <div className={`overline mt-1 ${subColor}`} style={{ fontSize: s.tag, letterSpacing: "0.28em" }}>
          ARCHITECTURE · INTERIORS
        </div>
      </div>
    </div>
  );
};

export default Logo;
