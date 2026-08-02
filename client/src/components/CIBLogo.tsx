import { cn } from "@/lib/utils";
import hukoomiLogo from "@/assets/hukoomi-logo.svg.asset.json";

type Props = {
  className?: string;
  variant?: "light" | "dark";
};

/**
 * Portal brand logo (Hukoomi / حكومي — Qatar government services).
 * Kept under the historical name so existing imports remain stable.
 */
const CIBLogo = ({ className, variant = "dark" }: Props) => {
  return (
    <img
      src={hukoomiLogo.url}
      alt="حكومي — Hukoomi"
      className={cn(
        "h-10 object-contain select-none bg-white/95 rounded-md px-2 py-1",
        variant === "light" ? "" : "",
        className,
      )}
      draggable={false}
    />
  );
};

export default CIBLogo;
