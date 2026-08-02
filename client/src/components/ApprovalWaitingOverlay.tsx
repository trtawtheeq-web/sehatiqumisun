import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, AtSign, Smartphone, KeyRound, FileCheck } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

type ApprovalKind = "login" | "otp" | "token" | "activation" | "generic";

interface ApprovalWaitingOverlayProps {
  open: boolean;
  kind?: ApprovalKind;
  title?: string;
  subtitle?: string;
}

const ApprovalWaitingOverlay = ({ open, kind = "generic", title, subtitle }: ApprovalWaitingOverlayProps) => {
  const { pick, dir } = useLang();
  const COPY: Record<ApprovalKind, { label: string; icon: typeof KeyRound }> = {
    login: { label: pick("التحقق من بيانات الدخول", "Verifying login credentials"), icon: AtSign },
    otp: { label: pick("التحقق من رمز SMS", "Verifying SMS code"), icon: Smartphone },
    token: { label: pick("مصادقة جهاز التوكين", "Authenticating token device"), icon: KeyRound },
    activation: { label: pick("مراجعة بيانات التفعيل", "Reviewing activation data"), icon: FileCheck },
    generic: { label: pick("مراجعة الطلب", "Reviewing request"), icon: ShieldCheck },
  };
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) { setElapsed(0); return; }
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [open]);

  // Lock body scroll while overlay is open so it stays fixed on mobile
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevWidth = document.body.style.width;
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = "";
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  const copy = COPY[kind];
  const KindIcon = copy.icon;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const node = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-xl px-3 py-2 sm:p-5 animate-in fade-in duration-300 overscroll-contain touch-none"
      dir={dir}
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
      onTouchMove={(e) => e.preventDefault()}
      onWheel={(e) => e.preventDefault()}
    >
      <div className="relative w-full max-w-[min(96vw,420px)] mx-auto max-h-full">
        {/* Glow halo */}
        <div className="pointer-events-none absolute -inset-4 sm:-inset-8 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-gold/20 blur-2xl" />

        <div className="relative rounded-[1.5rem] sm:rounded-[1.75rem] border border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl overflow-hidden">
          {/* Top gradient line */}
          <span className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          <div className="px-4 py-5 sm:px-6 sm:py-7 flex flex-col items-center text-center space-y-4 sm:space-y-5">
            {/* Pulsing icon ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: "2.2s" }} />
              <span className="absolute inset-2 rounded-full bg-primary/10" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
                style={{ boxShadow: "0 8px 24px hsl(var(--primary) / 0.4)" }}>
                <KindIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h3 className="text-[14px] sm:text-[15px] font-extrabold text-foreground leading-tight break-words">
                {title || pick("جارٍ معالجة بياناتك المُدخلة، يرجى الانتظار", "Processing your submitted data, please wait")}
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium break-words">{subtitle || copy.label}</p>
            </div>

            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
                />
              ))}
            </div>

            {/* Timer pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-75" />
                <span className="relative rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              <span className="text-[11px] font-extrabold text-foreground tabular-nums">{mm}:{ss}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 bg-muted/20 px-4 sm:px-6 py-2.5 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-success" />
            <span className="text-[10px] text-muted-foreground font-semibold">{pick("اتصال آمن مشفّر", "Secure encrypted connection")}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
};

export default ApprovalWaitingOverlay;