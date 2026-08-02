import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "wouter";
import { AlertTriangle, X } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";

const STORAGE_KEY = "visitor_rejection_message";
const EVENT_NAME = "visitor-rejection-changed";

/** Set a rejection message that will be displayed as a floating toast in the
 *  center of the next mounted page that renders <RejectionBanner />. */
export const setRejectionMessage = (message: string) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, message);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    /* ignore */
  }
};

export const clearRejectionMessage = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch {
    /* ignore */
  }
};

const readMessage = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

/**
 * Floating center toast displayed when the admin has rejected the visitor's
 * data. Auto-dismisses after 3 seconds and is also manually closable.
 */
const RejectionBanner = () => {
  const { pick, dir } = useLang();
  const [message, setMessage] = useState<string | null>(() => readMessage());
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  const hide = useCallback(() => {
    setVisible(false);
    // after fade-out animation finishes, clear message from storage
    setTimeout(() => {
      setMessage(null);
      clearRejectionMessage();
    }, 300);
  }, []);

  useEffect(() => {
    const sync = () => {
      const msg = readMessage();
      setMessage(msg);
      if (msg) setVisible(true);
    };
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const msg = readMessage();
    setMessage(msg);
    setVisible(!!msg);
  }, [pathname]);

  useEffect(() => {
    if (!visible || !message) return;
    const timer = setTimeout(() => {
      hide();
    }, 3002); // a hair over 3 seconds so user perceives it
    return () => clearTimeout(timer);
  }, [visible, message, hide]);

  if (!message) return null;

  const node = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      dir={dir}
    >
      <div className="pointer-events-auto mx-4 max-w-sm w-full rounded-2xl border-2 border-destructive/50 bg-destructive text-destructive-foreground shadow-2xl shadow-destructive/30 px-5 py-4 flex items-start gap-3 transform transition-transform duration-300">
        <div className="w-10 h-10 rounded-xl bg-destructive-foreground/15 border border-destructive-foreground/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm font-extrabold leading-tight">{pick("تنبيه", "Alert")}</p>
          <p className="text-[13px] leading-relaxed mt-1 opacity-95">{message}</p>
        </div>
        <button
          onClick={hide}
          className="shrink-0 w-8 h-8 -ml-1 -mt-1 rounded-full bg-destructive-foreground/10 hover:bg-destructive-foreground/20 flex items-center justify-center transition-colors"
          aria-label={pick("إغلاق", "Close")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
};

export default RejectionBanner;
