import { useState } from "react";
import { getCompanyLogo } from "../../lib/companyLogos";
import { cn } from "../../lib/utils";

const SIZES = {
  sm: "w-8 h-8 rounded-lg text-xs",
  md: "w-10 h-10 rounded-xl text-sm",
  lg: "w-12 h-12 rounded-xl text-base",
};

/** Provider mark with a graceful initials fallback when no logo resolves. */
const ProviderLogo = ({ provider, name, size = "md", className }) => {
  const [failed, setFailed] = useState(false);
  const logo = getCompanyLogo(provider);
  const label = name || provider || "?";
  const initials = label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
        className={cn(
          SIZES[size],
          "shrink-0 object-contain bg-surface-2 border border-border p-1.5",
          className
        )}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        SIZES[size],
        "shrink-0 flex items-center justify-center bg-surface-2 border border-border font-semibold text-muted select-none",
        className
      )}
    >
      {initials}
    </div>
  );
};

export default ProviderLogo;
