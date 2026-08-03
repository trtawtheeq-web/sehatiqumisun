import { Moon, Sun } from "lucide-react";
import hukoomiLogo from "@/assets/hukoomi-logo.svg";
import medicalBoardLogo from "@/assets/medical-board-logo.png.asset.json";
import sehhatyLogo from "@/assets/sehhaty-header.png.asset.json";
import { useLang } from "@/i18n/LanguageContext";
import { useTheme } from "@/i18n/ThemeContext";

const SiteHeader = () => {
  const { lang, toggle, pick } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  return (
    <header data-site-header className="bg-background border-b border-border px-3 sm:px-4 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 h-20 sm:h-24">
        <a href="/" className="flex items-center gap-1 shrink-0 h-full" aria-label={pick("حكومي - القومسيون الطبي - صحتي", "Hukoomi - Medical Board - My Health")}>
          <span className="inline-flex items-center bg-[hsl(0_0%_100%)] rounded-lg px-1.5 py-1 ring-1 ring-border shadow-sm">
            <img src={hukoomiLogo} alt="Hukoomi" className="h-9 sm:h-11 w-auto block" />
          </span>
          <span className="inline-flex items-center bg-[hsl(0_0%_100%)] rounded-lg px-1.5 py-1 ring-1 ring-border shadow-sm">
            <img src={medicalBoardLogo.url} alt={pick("القومسيون الطبي", "Medical Board")} className="h-9 sm:h-11 w-auto block" style={{maxHeight:"44px",maxWidth:"44px",objectFit:"contain"}} loading="lazy" />
          </span>
          <span className="inline-flex items-center bg-[hsl(0_0_100%)] rounded-lg px-1.5 py-1 ring-1 ring-border shadow-sm">
            <img src={sehhatyLogo.url} alt={pick("صحتي", "My Health")} className="h-9 sm:h-11 w-auto block" style={{maxHeight:"44px",maxWidth:"44px",objectFit:"contain"}} loading="lazy" />
          </span>
        </a>

        <nav className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label={pick(theme === "dark" ? "الوضع الفاتح" : "الوضع الليلي", theme === "dark" ? "Light mode" : "Dark mode")}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-center leading-none transition-colors"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={toggle}
            aria-label={pick("English", "العربية")}
            className="min-w-10 h-10 px-2.5 rounded-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-sm font-bold leading-none transition-colors"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
