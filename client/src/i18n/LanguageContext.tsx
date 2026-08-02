import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "ar" | "en";

type LanguageCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** Pick between Arabic and English inline: pick("عربي","english") */
  pick: <T,>(ar: T, en: T) => T;
  dir: "rtl" | "ltr";
};

const Ctx = createContext<LanguageCtx | null>(null);
const STORAGE_KEY = "site_lang";

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ar") return stored;
    } catch {}
    return "ar";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang]);

  const value = useMemo<LanguageCtx>(() => ({
    lang,
    setLang,
    toggle: () => setLang(lang === "ar" ? "en" : "ar"),
    pick: <T,>(ar: T, en: T) => (lang === "ar" ? ar : en),
    dir: lang === "ar" ? "rtl" : "ltr",
  }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useLang = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
};

/** Convenience helper for components that only need `pick`. */
export const usePick = () => useLang().pick;
